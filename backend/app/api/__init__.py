from .repositories import router as repositories_router
from .analytics    import router as analytics_router
from .ai           import router as ai_router

__all__ = ["repositories_router", "analytics_router", "ai_router"]