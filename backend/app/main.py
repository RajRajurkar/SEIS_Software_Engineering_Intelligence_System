import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import create_tables
from app.api import repositories_router, analytics_router, ai_router
from app.utils import setup_logger

logger = setup_logger("seis.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"  {settings.APP_NAME} v{settings.APP_VERSION}")

    create_tables()
    logger.info("Database ready.")

    yield

    logger.info("Application shutting down.")


app = FastAPI(
    title       = settings.APP_NAME,
    version     = settings.APP_VERSION,
    description = (
        "Software Engineering Intelligence System — "
        "Transform Git repository history into structured engineering knowledge."
    ),
    docs_url    = "/docs",
    redoc_url   = "/redoc",
    lifespan    = lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins     = settings.ALLOWED_ORIGINS,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code = 500,
        content     = {
            "success": False,
            "message": "An internal server error occurred.",
            "detail":  str(exc) if settings.DEBUG else "Internal server error",
        },
    )


app.include_router(repositories_router)
app.include_router(analytics_router)
app.include_router(ai_router)


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status":  "healthy",
        "app":     settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/", tags=["System"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs":    "/docs",
    }