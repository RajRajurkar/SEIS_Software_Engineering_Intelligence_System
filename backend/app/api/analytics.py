from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories import (
    AnalyticsRepository,
    ContributorRepository,
    EventRepository,
    RepositoryRepository,
)
from app.utils import setup_logger

logger = setup_logger(__name__)
router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])
analytics_repo = AnalyticsRepository()
contrib_repo = ContributorRepository()
event_repo = EventRepository()
repo_repo = RepositoryRepository()


def _require_analytics(db: Session, analysis_id: str):
    analytics = analytics_repo.get_by_repository(db, analysis_id)
    if not analytics:
        raise HTTPException(
            status_code=404,
            detail="Analytics not found. Repository may still be analysing.",
        )
    return analytics


@router.get("/overview/{analysis_id}")
def get_dashboard_overview(analysis_id: str, db: Session = Depends(get_db)):
    analytics = _require_analytics(db, analysis_id)
    repo = repo_repo.get_by_id(db, analysis_id)
    contributors = contrib_repo.get_by_repository(db, analysis_id)
    recent_events = event_repo.get_recent(db, analysis_id, limit=15)

    top_contributors = [
        {
            "name": c.name,
            "email": c.email,
            "commit_count": c.commit_count,
            "modules": c.modules or [],
        }
        for c in contributors[:6]
    ]

    top_modules = [
        {
            "name": m.get("name"),
            "change_count": m.get("change_count"),
        }
        for m in (analytics.module_activity or [])[:6]
    ]

    events_list = [
        {
            "event_type": e.event_type,
            "module": e.module,
            "summary": e.summary,
            "author_name": e.author_name,
            "event_date": e.event_date.isoformat() if e.event_date else None,
            "commit_message": e.commit_message,
        }
        for e in recent_events
    ]

    return {
        "total_commits": int(analytics.total_commits or 0),
        "total_contributors":  int(analytics.total_contributors  or 0),
        "total_files": int(analytics.total_files or 0),
        "total_branches": int(analytics.total_branches or 0),
        "total_insertions": int(analytics.total_insertions or 0),
        "total_deletions": int(analytics.total_deletions or 0),
        "first_commit_date": analytics.first_commit_date.isoformat() if analytics.first_commit_date else None,
        "last_commit_date": analytics.last_commit_date.isoformat()  if analytics.last_commit_date  else None,
        "primary_language": repo.primary_language if repo else None,
        "commit_activity": analytics.commit_activity or {},
        "language_distribution": analytics.language_distribution or {},
        "event_categories": analytics.event_categories or {},
        "top_contributors": top_contributors,
        "top_modules": top_modules,
        "recent_events": events_list,
    }


@router.get("/repository/{analysis_id}")
def get_repository_analytics(analysis_id: str, db: Session = Depends(get_db)):
    analytics = _require_analytics(db, analysis_id)

    by_day_data = analytics.commits_by_day or {}

    return {
        "total_commits": int(analytics.total_commits or 0),
        "total_contributors": int(analytics.total_contributors or 0),
        "total_files": int(analytics.total_files or 0),
        "total_insertions": int(analytics.total_insertions or 0),
        "total_deletions": int(analytics.total_deletions or 0),
        "first_commit_date": analytics.first_commit_date.isoformat() if analytics.first_commit_date else None,
        "last_commit_date": analytics.last_commit_date.isoformat()  if analytics.last_commit_date  else None,
        "commit_timeline": analytics.commit_timeline or {},
        "repository_growth": analytics.repository_growth or {},
        "insertions_deletions": analytics.insertions_deletions or {},
        "language_distribution":analytics.language_distribution or {},
        "event_categories": analytics.event_categories or {},
        "module_activity": analytics.module_activity or [],
        "file_hotspots": (analytics.file_hotspots or [])[:30],
        "commits_by_day": by_day_data.get("labels", ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]),
        "commits_by_day_values":by_day_data.get("values", [0,0,0,0,0,0,0]),
        "release_stats": analytics.release_stats or {},
    }


@router.get("/contributors/{analysis_id}")
def get_contributor_analytics(analysis_id: str, db: Session = Depends(get_db)):
    contributors = contrib_repo.get_by_repository(db, analysis_id)
    result = [
        {
            "name": c.name,
            "email": c.email,
            "commit_count": c.commit_count,
            "insertions": c.insertions,
            "deletions": c.deletions,
            "first_commit": c.first_commit.isoformat() if c.first_commit else None,
            "last_commit": c.last_commit.isoformat()  if c.last_commit  else None,
            "modules": c.modules or [],
        }
        for c in contributors
    ]
    return {"contributors": result, "total": len(result)}


@router.get("/modules/{analysis_id}")
def get_module_analytics(analysis_id: str, db: Session = Depends(get_db)):
    analytics = _require_analytics(db, analysis_id)
    modules   = analytics.module_activity or []
    return {"modules": modules, "total": len(modules)}


@router.get("/timeline/{analysis_id}")
def get_timeline_analytics(analysis_id: str, db: Session = Depends(get_db)):
    events = event_repo.get_by_repository(db, analysis_id, limit=500)
    result = [
        {
            "event_type": e.event_type,
            "module": e.module,
            "summary": e.summary,
            "author_name": e.author_name,
            "event_date":  e.event_date.isoformat() if e.event_date else None,
            "confidence":  e.confidence,
        }
        for e in events
    ]
    return {"events": result, "total": len(result)}