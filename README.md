# Quick Start Guide

## Prerequisites
- Python 3.10+
- Node 18+
- MySQL running locally

---

## 1. Database Setup

Open MySQL and run:
```sql
CREATE DATABASE roleapp;
```

---

## 2. Backend Setup

```powershell
cd backend

# Edit .env with your MySQL credentials
# DB_USER=root
# DB_PASSWORD=<your-password>
# DB_NAME=roleapp
# SECRET_KEY=<any-long-random-string>

# Activate virtual env
.\venv\Scripts\Activate

# Start the server (tables are auto-created on first run)
uvicorn main:app --reload
```

The API runs at: **http://localhost:8000**  
Swagger docs: **http://localhost:8000/docs**

---

## 3. Frontend Setup

```powershell
cd frontend
npm run dev
```

The app runs at: **http://localhost:5173**

---

## 4. Create an Admin

1. Sign up normally at http://localhost:5173/signup
2. In MySQL, promote the user:

```sql
USE roleapp;
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

3. Log in — you'll see the Admin Dashboard with **Manage Users** access.
