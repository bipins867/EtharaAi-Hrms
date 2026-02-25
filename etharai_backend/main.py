import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import init_db
from routes import employees, attendance, dashboard

app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight Human Resource Management System API",
    version="1.0.0"
)

# CORS — allow configured origins (comma-separated) or fall back to permissive for dev
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler for unhandled errors."""
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "HRMS Lite API is running"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=os.getenv("ENV", "dev") == "dev")
