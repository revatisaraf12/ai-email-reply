# 🤖 AI Email Reply Generator

A full stack AI-powered web application that generates smart email replies using Groq LLaMA AI.

## 🌟 Features
- 📧 AI-powered email reply generation
- 👔 Formal & Casual tone selection
- 🌐 Multilingual support (English, Hindi, Marathi, Gujarati, Tamil)
- 📋 Quick email templates
- 🔐 Login / Signup / Logout authentication
- 📊 Reply history saved to database
- 📋 Copy reply to clipboard
- 👤 User-wise history

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Axios
- Supabase JS Client

### Backend
- Python
- FastAPI
- Uvicorn

### AI & Database
- Groq LLaMA 3.3 (AI Model)
- Supabase (Database + Authentication)

### Concepts Used
- REST API
- Prompt Engineering
- Natural Language Processing
- JWT Authentication
- CORS Middleware

## 📸 Screenshots
> Login Page → Main App → Generate Reply → History

## 🚀 How to Run

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Environment Variables

### backend/.env