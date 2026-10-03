# CAREERGRAPH — Separated Frontend / Backend

## Structure
- \`backend/\` — FastAPI REST API, SQLite persistence, JWT access tokens, rotating refresh sessions, password hashing, email verification, password reset, evidence storage and AI services.
- \`frontend/\` — static HTML/CSS/JS only. No FastAPI/Jinja templates are used by the new application.

## Authentication
1. Register with email + password.
2. Verify email using a one-time token.
3. Login returns a short-lived access token and sets a secure refresh-token cookie.
4. Frontend stores the access token only in sessionStorage and automatically refreshes after a 401.
5. Logout revokes the refresh session.
6. Password change revokes all refresh sessions.
7. Forgot/reset password uses one-time expiring tokens.

## Local run
### Backend
cd backend
python -m venv .venv
pip install -r requirements.txt
copy .env.example .env  # Windows; use cp on macOS/Linux
uvicorn app.main:app --reload --port 8000

### Frontend
cd frontend
python -m http.server 5500
Open http://localhost:5500/login

Set \`frontend/assets/config.js\` to the deployed backend URL before deploying the frontend.

## Production
- Deploy \`backend/\` to Render using \`backend/render.yaml\`.
- Deploy \`frontend/\` to Vercel using the included \`vercel.json\`.
- Set \`FRONTEND_ORIGIN\` to the exact Vercel origin.
- Set \`COOKIE_SECURE=true\` and \`COOKIE_SAMESITE=none\` when frontend and backend are on different sites.
- Set a strong \`JWT_SECRET\`.
- Configure SMTP variables for real verification/reset emails.
- Configure \`OPENAI_API_KEY\` to enable the AI evidence/analysis layer; without it, the backend uses a deterministic explainable fallback.
