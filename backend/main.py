from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-email-reply-nine.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class EmailRequest(BaseModel):
    email_text: str
    tone: str
    language: str = "English"
    user_id: str = ""

@app.post("/generate-reply")
async def generate_reply(req: EmailRequest):
    if req.tone not in ["formal", "casual"]:
        raise HTTPException(status_code=400, detail="Tone must be 'formal' or 'casual'")

    system_prompt = f"""You are an expert email assistant.
    Generate a {'professional and polished' if req.tone == 'formal' else 'friendly and conversational'} 
    email reply in {req.language} language.
    Be concise, clear, and appropriate for the tone.
    Only return the reply text, no explanations."""

    user_prompt = f"Original Email:\n{req.email_text}\n\nWrite a {req.tone} reply:"

    api_key = os.getenv('GROK_API_KEY')
    print(f"API KEY LOADED: {api_key[:10] if api_key else 'NONE'}")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "max_tokens": 500
                },
                timeout=30
            )
        print(f"GROQ STATUS: {response.status_code}")
        print(f"GROQ RESPONSE: {response.text}")

    except Exception as e:
        print(f"EXCEPTION: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Grok API error")

    reply_text = response.json()["choices"][0]["message"]["content"]

    try:
        supabase.table("email_logs").insert({
            "original_email": req.email_text,
            "tone": req.tone,
            "generated_reply": reply_text,
            "user_id": req.user_id
        }).execute()
    except Exception as e:
        print(f"SUPABASE ERROR: {e}")

    return {"reply": reply_text}

@app.get("/history/{user_id}")
def get_history(user_id: str):
    try:
        result = supabase.table("email_logs") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(10) \
            .execute()
        return {"history": result.data}
    except Exception as e:
        print(f"HISTORY ERROR: {e}")
        return {"history": []}