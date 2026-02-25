import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import setup_indexes
from routes import employees, attendance, dashboard

# --- application setup ---

app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight Human Resource Management System API",
    version="1.0.0",
)

# CORS configuration
_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- register route modules ---
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)


# --- events ---

@app.on_event("startup")
async def on_startup():
    setup_indexes()


# --- global error handler ---

@app.exception_handler(Exception)
async def handle_unhandled(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# --- health ---

@app.get("/")
async def health():
    return {"status": "ok", "message": "HRMS Lite API is running"}


# --- entrypoint ---

if __name__ == "__main__":
    import uvicorn

    _port = int(os.getenv("PORT", 8000))
    _reload = os.getenv("ENV", "dev") == "dev"
    uvicorn.run("main:app", host="0.0.0.0", port=_port, reload=_reload)
