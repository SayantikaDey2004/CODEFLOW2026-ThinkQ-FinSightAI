from fastapi import FastAPI, Request, Depends, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from app.models.pydantic_models import LoginRequest, SignupRequest, ResetPasswordRequest, ForgotPasswordRequest
from app.db.database import insert_data, update_password, delete_data, get_data, save_statement_analysis, get_latest_statement_analysis
from app.services.statement_service import analyze_statement_files
from modules.hashed_password import create_hashed_password,check_password
from modules.token import create_token, decode_token
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

outh = OAuth2PasswordBearer(tokenUrl="/token")

@app.get("/")
def home(request: Request):
    return {"message": "success"}


@app.post("/token")
def new_token(data: dict):
    try:
        token = create_token(data)
    except Exception as e:
        return {"error": str(e)}
    else:
        return {"access_token": token, "token_type": "bearer"}
@app.get("/api/v1/dashboard/summary")
async def get_dashboard_summary(authorization: str | None = Header(default=None)):
    user_key = _statement_user_key(authorization)
    stored = get_latest_statement_analysis(user_key)
    if not stored:
        stored = get_latest_statement_analysis("anonymous")

    if not stored:
        # Return empty dashboard instead of 404
        return {
            "healthScore": 0, "totalIncome": 0, "totalExpense": 0,
            "currentBalance": 0, "savings": 0, "incomeChangePct": 0,
            "expenseChangePct": 0, "savingsPct": 0, "transactionCount": 0,
            "monthlyData": [], "categories": [], "recurring": [],
            "unusual": [], "aiInsights": [], "txList": []
        }

    summary = stored.get("summary", {})
    cat_colors = ["#22c55e","#0ea5e9","#f97316","#8b5cf6","#ec4899","#f59e0b","#14b8a6"]
    categories = [
        {"name": cat, "amount": amt,
         "pct": round(amt / max(summary.get("total_expense",1),1) * 100),
         "color": cat_colors[i % len(cat_colors)]}
        for i, (cat, amt) in enumerate(summary.get("category_breakdown", {}).items())
    ]
    recurring = [
        {"name": r["name"], "date": "monthly", "amount": r["avg_amount"],
         "status": "active", "icon": "🔄", "color": "#0ea5e9"}
        for r in stored.get("recurring", [])
    ]
    unusual = [
        {"name": u["merchant"], "reason": f"Flagged: ₹{abs(u['amount']):,.0f}",
         "amount": abs(u["amount"]), "icon": "⚠️"}
        for u in stored.get("unusual", [])
    ]
    ai = stored.get("ai_summary", {})
    ai_insights = [
        {"icon": "🧠", "title": "Overview", "text": ai.get("overview","")},
        *[{"icon": "📌", "title": "Observation", "text": obs} for obs in ai.get("observations",[])],
        *[{"icon": "💡", "title": "Recommendation", "text": rec} for rec in ai.get("recommendations",[])]
    ]
    txList = [
        {"date": t["date"], "name": t["merchant"], "bank": "Statement",
         "cat": t["category"], "catColor": "#0ea5e9", "icon": "💳",
         "iconBg": "#1e3a5f", "amount": t["amount"],
         "status": "flagged" if t.get("unusual") else "completed"}
        for t in stored.get("transactions", [])[:20]
    ]
    net = summary.get("net_savings", 0)
    return {
        "healthScore": ai.get("health_score", 0),
        "totalIncome": summary.get("total_income", 0),
        "totalExpense": summary.get("total_expense", 0),
        "currentBalance": net,
        "savings": net,
        "incomeChangePct": 0,
        "expenseChangePct": 0,
        "savingsPct": summary.get("savings_rate", 0),
        "transactionCount": summary.get("transaction_count", 0),
        "monthlyData": stored.get("monthly_trend", []),
        "categories": categories,
        "recurring": recurring,
        "unusual": unusual,
        "aiInsights": ai_insights,
        "txList": txList,
    }
@app.post("/api/v1/auth/signup")
async def new_user(data: SignupRequest):
    hash_pw = create_hashed_password(data.password)
    data.password = hash_pw.decode("UTF-8")
    try:
        d = insert_data(data.model_dump())
    except Exception as e:
        return {"Error": f"Signup failed: {str(e)}"}
    else:
        token = create_token({"email": data.email})
        return {"new_user": d, "token": token}
@app.post("/api/v1/auth/login")
async def user_login(data: LoginRequest):
    k = get_data(data.email)
    if not k or not check_password(data.password, k.get("password")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"email": k["email"], "name": k["name"]})
    return {
        "access_token": token,
        "refresh_token": token,   # no refresh logic yet, reuse same token
        "token_type": "bearer",
        "user": {
            "id": str(k.get("_id", "")),
            "name": k["name"],
            "email": k["email"],
            "is_active": True,
            "is_verified": True,
            "created_at": ""
        }
    }
@app.post("/update_password")
def update_pass(data: LoginRequest,token=Depends(outh)):
    try:
        d = update_password(data.email, create_hashed_password(data.password))
    except Exception as e:
        return {"response": str(e)}
    else:
        return {"password": d}

@app.post("/delete_user")
def delete_user(email:str,token=Depends(outh)):
    try:
        d = delete_data(email)
    except Exception as e:
        return {"response": str(e)}
    else:
        return {"delete": d}

@app.post("/api/v1/auth/logout")
def user_logout(request: Request, token=Depends(outh)):
    token=""
    # In stateless JWT, logout is client-side (just discard token).
    return {"logout": "successful"}

@app.get("/profile")
async def get_profile(request:Request,token=Depends(outh)):
    try:
        data=decode_token(token)
    except Exception as e:
        return {"error":e}
    else:
        return {"user_data":data}


def _statement_user_key(authorization: str | None) -> str:
    if not authorization:
        return "anonymous"

    token = authorization.removeprefix("Bearer ").strip()
    decoded = decode_token(token)
    if not decoded:
        return "anonymous"

    return str(decoded.get("email") or decoded.get("id") or decoded.get("sub") or "anonymous")


@app.post("/api/v1/statements/upload")
async def upload_statement(files: list[UploadFile] = File(...), authorization: str | None = Header(default=None)):
    try:
        analysis = await analyze_statement_files(files)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error))
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {error}")

    user_key = _statement_user_key(authorization)
    stored = save_statement_analysis(user_key, analysis)
    stored.pop("_id", None)
    return stored


@app.get("/api/v1/statements/latest")
async def latest_statement(authorization: str | None = Header(default=None)):
    user_key = _statement_user_key(authorization)
    stored = get_latest_statement_analysis(user_key)
    if not stored and user_key != "anonymous":
        stored = get_latest_statement_analysis("anonymous")

    if not stored:
        raise HTTPException(status_code=404, detail="No uploaded statement analysis found.")

    stored.pop("_id", None)
    return json.loads(json.dumps(stored, default=str))
