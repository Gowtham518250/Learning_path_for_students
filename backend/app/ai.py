import json
import re
from typing import Any
import httpx
from .config import settings

ROLE_SKILLS = {
 "ai_engineering":{"name":"AI & Machine Learning Engineering","skills":{"python":1.0,"machine learning":1.0,"deep learning":0.95,"pytorch":0.9,"tensorflow":0.85,"nlp":0.85,"computer vision":0.8,"transformers":0.95,"sql":0.55,"docker":0.6,"fastapi":0.65,"mlops":0.8}},
 "data_science":{"name":"Data Science & Analytics","skills":{"python":1.0,"sql":0.95,"statistics":0.95,"pandas":0.8,"numpy":0.7,"machine learning":0.9,"data visualization":0.75,"power bi":0.55,"tableau":0.55,"git":0.45}},
 "web_development":{"name":"Full Stack Web Development","skills":{"html":0.8,"css":0.75,"javascript":1.0,"react":0.9,"node.js":0.8,"python":0.65,"fastapi":0.65,"sql":0.8,"rest api":0.85,"docker":0.55,"git":0.75}},
 "cloud_devops":{"name":"Cloud & DevOps Engineering","skills":{"linux":0.9,"docker":1.0,"kubernetes":0.95,"aws":0.95,"terraform":0.75,"ci/cd":0.85,"python":0.6,"git":0.8,"networking":0.8,"monitoring":0.6}},
 "cybersecurity":{"name":"Cybersecurity Engineering","skills":{"network security":1.0,"linux":0.9,"python":0.75,"cryptography":0.8,"ethical hacking":0.9,"web security":0.9,"siem":0.7,"git":0.45}},
 "computer_vision":{"name":"Computer Vision Engineering","skills":{"python":1.0,"opencv":0.9,"computer vision":1.0,"pytorch":0.9,"tensorflow":0.75,"cnn":0.9,"yolo":0.8,"numpy":0.7,"deep learning":0.9,"docker":0.45}},
}

def normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())

def deterministic_analysis(career_goal: str, skills: list[str], evidence_text: str = "") -> dict[str, Any]:
    goal = ROLE_SKILLS.get(career_goal, ROLE_SKILLS["ai_engineering"])
    supplied = {normalize(s) for s in skills if s.strip()}
    text = normalize(evidence_text)
    matched, missing = [], []
    for skill, weight in goal["skills"].items():
        if skill in supplied or skill in text:
            matched.append({"skill": skill, "score": round(min(1.0, 0.55 + weight * 0.4), 2), "evidence": "profile/evidence"})
        else:
            missing.append({"skill": skill, "importance": weight, "gap": round(weight, 2)})
    readiness = round(100 * sum(x["score"] for x in matched) / max(1, sum(goal["skills"].values())), 1)
    prioritized = sorted(missing, key=lambda x: x["importance"] * x["gap"], reverse=True)
    roadmap = [
        {"phase":"Foundation","tasks":[x["skill"] for x in prioritized[:3]]},
        {"phase":"Core","tasks":[x["skill"] for x in prioritized[3:6]]},
        {"phase":"Production","tasks":["build one end-to-end project","deploy it","document evidence"]},
    ]
    return {"career":goal["name"],"readiness":readiness,"matched_skills":matched,"gaps":prioritized,"priority_skills":[x["skill"] for x in prioritized[:5]],"roadmap":roadmap,"explanation":"The roadmap prioritizes high-importance skills that have weak or missing evidence.","ai_provider":"deterministic-fallback"}

def _extract_output(payload: dict[str, Any]) -> str:
    choices = payload.get("choices") or []
    return (choices[0].get("message", {}).get("content", "") if choices else "") or ""

async def ai_analysis(career_goal: str, skills: list[str], evidence_text: str = "") -> dict[str, Any]:
    fallback = deterministic_analysis(career_goal, skills, evidence_text)
    if not settings.openai_api_key:
        return fallback
    prompt = {"career_goal":career_goal,"skills":skills,"evidence_excerpt":evidence_text[:12000],"role_skill_weights":ROLE_SKILLS.get(career_goal, ROLE_SKILLS["ai_engineering"])["skills"]}
    system = "You are CAREERGRAPH, an explainable skill-gap engine. Return ONLY valid JSON with keys readiness, matched_skills, gaps, priority_skills, roadmap, explanation. Do not invent evidence. Treat unverified claims as weak evidence."
    try:
        async with httpx.AsyncClient(timeout=45) as client:
            resp = await client.post("https://api.openai.com/v1/chat/completions",headers={"Authorization":f"Bearer {settings.openai_api_key}"},json={"model":settings.openai_model,"temperature":0.1,"messages":[{"role":"system","content":system},{"role":"user","content":json.dumps(prompt)}]})
            resp.raise_for_status()
            data = json.loads(_extract_output(resp.json()))
            data["career"] = ROLE_SKILLS.get(career_goal, {}).get("name", career_goal)
            data["ai_provider"] = "openai"
            return data
    except Exception:
        return fallback

async def extract_skills_from_evidence(text: str) -> tuple[list[str], float]:
    known = sorted({s for role in ROLE_SKILLS.values() for s in role["skills"]})
    found = [s for s in known if re.search(r"\b" + re.escape(s) + r"\b", text, flags=re.I)]
    confidence = round(min(0.95, 0.35 + len(found) / max(10, len(known)) * 0.6), 2)
    if not settings.openai_api_key:
        return found, confidence
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post("https://api.openai.com/v1/chat/completions",headers={"Authorization":f"Bearer {settings.openai_api_key}"},json={"model":settings.openai_model,"temperature":0,"messages":[{"role":"system","content":'Return JSON only: {"skills":[string],"confidence":number}. Extract only skills explicitly evidenced by the text.'},{"role":"user","content":text[:12000]}]})
            resp.raise_for_status()
            data = json.loads(_extract_output(resp.json()))
            return data.get("skills", found), float(data.get("confidence", confidence))
    except Exception:
        return found, confidence
