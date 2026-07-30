from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import logging

from app.database import get_db, SessionLocal
from app.schemas import (
    RepositorySubmitRequest,
    AnalyzeResponse,
    RepositoryStatusResponse,
    RepositoryResponse,
    RepositoryListResponse,
)
from app.repositories import RepositoryRepository, AnalyticsRepository
from app.services.analysis_service import analysis_service
from app.utils import extract_repo_info

logger    = logging.getLogger(__name__)
router    = APIRouter(prefix="/api/v1/repositories", tags=["Repositories"])
repo_repo = RepositoryRepository()


def run_analysis_background(repository_id: str):
    db = SessionLocal()
    try:
        analysis_service.run_analysis(db, repository_id)
    finally:
        db.close()


@router.post("/analyze", response_model=AnalyzeResponse, status_code=202)
async def submit_repository(
    request: RepositorySubmitRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    github_url = request.github_url.strip().rstrip("/")

    existing = repo_repo.get_by_url(db, github_url)
    if existing:
        return AnalyzeResponse(
            analysis_id = str(existing.id),
            status = existing.status.value,
            message = "Repository already exists. Returning existing analysis.",
        )

    owner, name = extract_repo_info(github_url)
    repo = repo_repo.create(db, github_url, owner, name)

    background_tasks.add_task(run_analysis_background, str(repo.id))

    logger.info(f"Analysis queued for {github_url} [{repo.id}]")

    return AnalyzeResponse(
        analysis_id = str(repo.id),
        status = "pending",
        message = "Repository submitted successfully. Analysis started.",
    )


@router.get("/{analysis_id}/status", response_model=RepositoryStatusResponse)
def get_status(analysis_id: str, db: Session = Depends(get_db)):
    repo = repo_repo.get_by_id(db, analysis_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return RepositoryStatusResponse(
        analysis_id = str(repo.id),
        status = repo.status.value,
        current_stage = repo.current_stage,
        github_url = repo.github_url,
        repository_name = f"{repo.owner}/{repo.name}" if repo.owner and repo.name else None,
        started_at = repo.started_at,
        completed_at = repo.completed_at,
        error_message = repo.error_message,
    )


@router.get("/", response_model=RepositoryListResponse)
def list_repositories(db: Session = Depends(get_db)):
    repos = repo_repo.get_all(db)
    analytics_repo = AnalyticsRepository()
    items = []

    for repo in repos:
        analytics = analytics_repo.get_by_repository(db, str(repo.id))
        items.append(RepositoryResponse(
            id = str(repo.id),
            github_url = repo.github_url,
            owner = repo.owner,
            name = repo.name,
            description = repo.description,
            default_branch = repo.default_branch,
            primary_language = repo.primary_language,
            status = repo.status.value,
            created_at = repo.created_at,
            completed_at = repo.completed_at,
            total_commits = int(analytics.total_commits) if analytics else None,
            total_contributors = int(analytics.total_contributors)   if analytics else None,
        ))

    return RepositoryListResponse(repositories=items, total=len(items))


@router.get("/{analysis_id}", response_model=RepositoryResponse)
def get_repository(analysis_id: str, db: Session = Depends(get_db)):
    analytics_repo = AnalyticsRepository()
    repo           = repo_repo.get_by_id(db, analysis_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    analytics = analytics_repo.get_by_repository(db, analysis_id)
    return RepositoryResponse(
        id = str(repo.id),
        github_url = repo.github_url,
        owner = repo.owner,
        name = repo.name,
        description = repo.description,
        default_branch = repo.default_branch,
        primary_language = repo.primary_language,
        status = repo.status.value,
        created_at = repo.created_at,
        completed_at = repo.completed_at,
        total_commits = int(analytics.total_commits) if analytics else None,
        total_contributors = int(analytics.total_contributors) if analytics else None,
    )


@router.delete("/{analysis_id}")
def delete_repository(analysis_id: str, db: Session = Depends(get_db)):
    success = repo_repo.delete(db, analysis_id)
    if not success:
        raise HTTPException(status_code=404, detail="Repository not found")
    return {"message": "Analysis deleted successfully"}