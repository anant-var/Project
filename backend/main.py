from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import auth, users

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Role-Based Auth API",
    description="FastAPI backend with JWT auth, MySQL, and Admin/User roles.",
    version="1.0.0",
)

# Allow the React dev server (port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "API is running"}
