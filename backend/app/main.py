import uuid
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from pathlib import Path

import jwt
from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from pypdf import PdfReader

from .ai import ROLE_SKILLS, ai_analysis, extract_skills_from_evidence
from .config import settings
from .db import execute, fetch_all, fetch_one, init_db, json_dumps, json_loads, now_iso
from .security import create_token, decode_token, hash_password, hash_token, verify_password

app = FastAPI(title=settings.app_name, version="2.0.0")
origins = [x.strip() for x in settings.frontend_origin.split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"], allow_headers=["Authorization","Content-Type"])

@app.on_event("startup")
def startup() -> None:
    init_db()

@app.middleware("http")
async def origin_guard(request: Request, call_next):
    if request.method not in {"GET","HEAD","OPTIONS"}:
        origin = request.headers.get("origin")
        if origin and origin not in origins:
            return JSONResponse(status_code=403, content={"detail":"Origin not allowed"})
    return await call_next(request)

class RegisterIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class EmailIn(BaseModel):
    email: EmailStr

class VerifyIn(BaseModel):
    token: str

class ResetIn(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

class AnalyzeIn(BaseModel):
    career_goal: str
    skills: list[str] = []

async def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Authentication required")
    try:
        payload = decode_token(authorization.split(" ",1)[1].strip(), "access")
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired access token")
    user = fetch_one("SELECT * FROM users WHERE id=? AND is_active=1", (payload["sub"],))
    if not user:
        raise HTTPException(401, "User not found or inactive")
    return user

def send_email(to_email: str, subject: str, body: str) -> bool:
    if not all([settings.smtp_host,settings.smtp_user,settings.smtp_password,settings.smtp_from]):
        return False
    msg = EmailMessage()
    msg["From"], msg["To"], msg["Subject"] = settings.smtp_from, to_email, subject
    msg.set_content(body)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
    return True

def issue_token(table: str, user_id: str, hours: int) -> str:
    raw = secrets.token_urlsafe(32)
    expires = (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()
    execute(f"INSERT INTO {table}(token_hash,user_id,expires_at) VALUES(?,?,?)", (hash_token(raw), user_id, expires))
    return raw

def auth_tokens(user_id: str) -> dict:
    access, _, _ = create_token(user_id, "access", timedelta(minutes=settings.access_minutes))
    refresh, jti, exp = create_token(user_id, "refresh", timedelta(days=settings.refresh_days))
    execute("INSERT INTO refresh_tokens(jti,user_id,token_hash,expires_at) VALUES(?,?,?,?)", (jti,user_id,hash_token(refresh),exp.isoformat()))
    return {"access_token":access,"refresh_token":refresh,"expires_in":settings.access_minutes*60}

def safe_user(user: dict) -> dict:
    return {k:user[k] for k in ["id","email","full_name","is_verified","created_at"]}

@app.get("/api/health")
def health():
    return {"status":"ok","service":"careergraph-api","version":"2.0.0"}

@app.post("/api/auth/register")
async def register(body: RegisterIn):
    email = body.email.lower().strip()
    if fetch_one("SELECT id FROM users WHERE email=?", (email,)):
        raise HTTPException(409, "An account already exists for this email")
    user_id = str(uuid.uuid4()); created = now_iso()
    execute("INSERT INTO users(id,email,full_name,password_hash,is_active,is_verified,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",(user_id,email,body.full_name.strip(),hash_password(body.password),1,0,created,created))
    token = issue_token("verification_tokens", user_id, 24)
    url = f"{settings.frontend_origin.rstrip('/')}/verify-email?token={token}"
    delivered = send_email(email,"Verify your CAREERGRAPH account",f"Verify your account: {url}")
    result = {"message":"Account created. Verify your email before login.","email_delivered":delivered}
    if settings.debug and not delivered: result["verification_token"] = token
    return result

@app.post("/api/auth/verify-email")
async def verify_email(body: VerifyIn):
    row = fetch_one("SELECT * FROM verification_tokens WHERE token_hash=? AND used_at IS NULL",(hash_token(body.token),))
    if not row or datetime.fromisoformat(row["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(400,"Verification token is invalid or expired")
    execute("UPDATE users SET is_verified=1,updated_at=? WHERE id=?",(now_iso(),row["user_id"]))
    execute("UPDATE verification_tokens SET used_at=? WHERE token_hash=?",(now_iso(),row["token_hash"]))
    return {"message":"Email verified successfully"}

@app.post("/api/auth/resend-verification")
async def resend_verification(body: EmailIn):
    user = fetch_one("SELECT * FROM users WHERE email=?",(body.email.lower().strip(),))
    if not user: return {"message":"If the account exists, a verification email will be sent."}
    if user["is_verified"]: return {"message":"Account is already verified."}
    token = issue_token("verification_tokens",user["id"],24)
    url = f"{settings.frontend_origin.rstrip('/')}/verify-email?token={token}"
    delivered = send_email(user["email"],"Verify your CAREERGRAPH account",f"Verify your account: {url}")
    result={"message":"Verification link generated.","email_delivered":delivered}
    if settings.debug and not delivered: result["verification_token"]=token
    return result

@app.post("/api/auth/login")
async def login(body: LoginIn):
    user = fetch_one("SELECT * FROM users WHERE email=?",(body.email.lower().strip(),))
    if not user or not verify_password(body.password,user["password_hash"]): raise HTTPException(401,"Invalid email or password")
    if not user["is_verified"]: raise HTTPException(403,"Email verification required")
    tokens=auth_tokens(user["id"])
    response=JSONResponse({"user":safe_user(user),"access_token":tokens["access_token"],"expires_in":tokens["expires_in"]})
    response.set_cookie("careergraph_refresh",tokens["refresh_token"],httponly=True,secure=settings.cookie_secure,samesite=settings.cookie_samesite,max_age=settings.refresh_days*86400,path="/api/auth")
    return response

@app.post("/api/auth/refresh")
async def refresh(request: Request):
    raw=request.cookies.get("careergraph_refresh")
    if not raw: raise HTTPException(401,"Refresh session missing")
    try: payload=decode_token(raw,"refresh")
    except jwt.PyJWTError: raise HTTPException(401,"Refresh session expired")
    row=fetch_one("SELECT * FROM refresh_tokens WHERE jti=? AND token_hash=? AND revoked_at IS NULL",(payload["jti"],hash_token(raw)))
    if not row or datetime.fromisoformat(row["expires_at"]) < datetime.now(timezone.utc): raise HTTPException(401,"Refresh session invalid")
    execute("UPDATE refresh_tokens SET revoked_at=? WHERE jti=?",(now_iso(),payload["jti"]))
    tokens=auth_tokens(payload["sub"]); user=fetch_one("SELECT * FROM users WHERE id=?",(payload["sub"],))
    response=JSONResponse({"user":safe_user(user),"access_token":tokens["access_token"],"expires_in":tokens["expires_in"]})
    response.set_cookie("careergraph_refresh",tokens["refresh_token"],httponly=True,secure=settings.cookie_secure,samesite=settings.cookie_samesite,max_age=settings.refresh_days*86400,path="/api/auth")
    return response

@app.post("/api/auth/logout")
async def logout(request: Request):
    raw=request.cookies.get("careergraph_refresh")
    if raw:
        try:
            payload=decode_token(raw,"refresh")
            execute("UPDATE refresh_tokens SET revoked_at=? WHERE jti=?",(now_iso(),payload["jti"]))
        except Exception: pass
    response=JSONResponse({"message":"Logged out"}); response.delete_cookie("careergraph_refresh",path="/api/auth"); return response

@app.get("/api/auth/me")
async def me(user=Depends(current_user)): return {"user":safe_user(user)}

@app.post("/api/auth/change-password")
async def change_password(body: ChangePasswordIn,user=Depends(current_user)):
    if not verify_password(body.current_password,user["password_hash"]): raise HTTPException(400,"Current password is incorrect")
    execute("UPDATE users SET password_hash=?,updated_at=? WHERE id=?",(hash_password(body.new_password),now_iso(),user["id"]))
    execute("UPDATE refresh_tokens SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL",(now_iso(),user["id"]))
    return {"message":"Password changed. Please sign in again."}

@app.post("/api/auth/forgot-password")
async def forgot_password(body: dict):
    email=str(body.get("email","")).lower().strip()
    result={"message":"If the account exists, a reset link will be sent."}; user=fetch_one("SELECT * FROM users WHERE email=?",(email,))
    if not user: return result
    token=issue_token("password_reset_tokens",user["id"],0.5)
    url=f"{settings.frontend_origin.rstrip('/')}/reset-password?token={token}"
    delivered=send_email(email,"Reset your CAREERGRAPH password",f"Reset your password: {url}")
    result["email_delivered"]=delivered
    if settings.debug and not delivered: result["reset_token"]=token
    return result

@app.post("/api/auth/reset-password")
async def reset_password(body: ResetIn):
    row=fetch_one("SELECT * FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL",(hash_token(body.token),))
    if not row or datetime.fromisoformat(row["expires_at"]) < datetime.now(timezone.utc): raise HTTPException(400,"Reset token is invalid or expired")
    execute("UPDATE users SET password_hash=?,updated_at=? WHERE id=?",(hash_password(body.new_password),now_iso(),row["user_id"]))
    execute("UPDATE password_reset_tokens SET used_at=? WHERE token_hash=?",(now_iso(),row["token_hash"]))
    execute("UPDATE refresh_tokens SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL",(now_iso(),row["user_id"]))
    return {"message":"Password reset successful"}

@app.get("/api/careers")
def careers(user=Depends(current_user)):
    return {"careers":[{"key":k,"name":v["name"],"skills":v["skills"]} for k,v in ROLE_SKILLS.items()]}

@app.post("/api/analyze")
async def analyze(body: AnalyzeIn,user=Depends(current_user)):
    if body.career_goal not in ROLE_SKILLS: raise HTTPException(400,"Unknown career goal")
    evidence=fetch_all("SELECT content FROM evidence WHERE user_id=? ORDER BY created_at DESC LIMIT 10",(user["id"],))
    evidence_text="\n".join(x["content"] for x in evidence)
    result=await ai_analysis(body.career_goal,body.skills,evidence_text)
    analysis_id=str(uuid.uuid4())
    execute("INSERT INTO analyses(id,user_id,career_goal,payload,created_at) VALUES(?,?,?,?,?)",(analysis_id,user["id"],body.career_goal,json_dumps(result),now_iso()))
    return {"analysis_id":analysis_id,"result":result}

@app.post("/api/evidence")
async def upload_evidence(file: UploadFile=File(...),user=Depends(current_user)):
    suffix=Path(file.filename or "").suffix.lower(); raw=await file.read()
    if suffix==".pdf":
        temp=Path.cwd()/f"tmp_{uuid.uuid4()}.pdf"; temp.write_bytes(raw)
        try: text="\n".join((p.extract_text() or "") for p in PdfReader(str(temp)).pages)
        finally: temp.unlink(missing_ok=True)
    else:
        text=raw.decode("utf-8",errors="ignore")
    if not text.strip(): raise HTTPException(400,"No readable text found in evidence")
    skills,confidence=await extract_skills_from_evidence(text)
    evidence_id=str(uuid.uuid4())
    execute("INSERT INTO evidence(id,user_id,title,source_type,content,extracted_skills,confidence,created_at) VALUES(?,?,?,?,?,?,?,?)",(evidence_id,user["id"],file.filename or "evidence",suffix.lstrip(".") or "text",text[:50000],json_dumps(skills),confidence,now_iso()))
    return {"id":evidence_id,"title":file.filename,"extracted_skills":skills,"confidence":confidence}

@app.get("/api/evidence")
def list_evidence(user=Depends(current_user)):
    rows=fetch_all("SELECT id,title,source_type,extracted_skills,confidence,created_at FROM evidence WHERE user_id=? ORDER BY created_at DESC",(user["id"],))
    for row in rows: row["extracted_skills"]=json_loads(row["extracted_skills"],[])
    return {"evidence":rows}

@app.get("/api/analyses/latest")
def latest_analysis(user=Depends(current_user)):
    row=fetch_one("SELECT * FROM analyses WHERE user_id=? ORDER BY created_at DESC LIMIT 1",(user["id"],))
    if not row: return {"analysis":None}
    return {"analysis":{"id":row["id"],"career_goal":row["career_goal"],"created_at":row["created_at"],"result":json_loads(row["payload"],{})}}
