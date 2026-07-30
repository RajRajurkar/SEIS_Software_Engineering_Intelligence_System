from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.schemas import AIChatRequest, AIChatResponse, AISummaryResponse
from app.repositories import (
    RepositoryRepository,
    AnalyticsRepository,
    EventRepository,
    AIInsightRepository,
)
from app.ai import AIAssistant
from app.utils import setup_logger

logger = setup_logger(__name__)
router = APIRouter(prefix="/api/v1/ai", tags=["AI Assistant"])
repo_repo = RepositoryRepository()
analytics_repo = AnalyticsRepository()
event_repo = EventRepository()
ai_insight_repo = AIInsightRepository()
ai_assistant = AIAssistant()


def _get_context(db: Session, analysis_id: str):
    repo = repo_repo.get_by_id(db, analysis_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    analytics = analytics_repo.get_by_repository(db, analysis_id)
    if not analytics:
        raise HTTPException(
            status_code=404,
            detail="Analytics not ready. Repository may still be analysing.",
        )

    events = event_repo.get_by_repository(db, analysis_id, limit=100)

    repository_info = {
        "owner": repo.owner,
        "name": repo.name,
        "description": repo.description,
        "primary_language": repo.primary_language,
        "default_branch": repo.default_branch,
    }

    analytics_dict = {
        "total_commits": int(analytics.total_commits or 0),
        "total_contributors": int(analytics.total_contributors or 0),
        "total_files": int(analytics.total_files or 0),
        "total_branches": int(analytics.total_branches or 0),
        "total_insertions": int(analytics.total_insertions or 0),
        "total_deletions": int(analytics.total_deletions or 0),
        "first_commit_date": analytics.first_commit_date,
        "last_commit_date": analytics.last_commit_date,
        "language_distribution": analytics.language_distribution or {},
        "event_categories": analytics.event_categories or {},
        "module_activity": analytics.module_activity or [],
        "contributor_ranking":  analytics.contributor_ranking or [],
        "commit_timeline": analytics.commit_timeline or {},
        "release_stats": analytics.release_stats or {},
    }

    events_list = [
        {
            "event_type": e.event_type,
            "module": e.module,
            "summary": e.summary,
            "author_name": e.author_name,
            "author_email": e.author_email,
            "event_date": e.event_date,
            "commit_message": e.commit_message,
        }
        for e in events
    ]

    return repository_info, analytics_dict, events_list


@router.get("/{analysis_id}/summary", response_model=AISummaryResponse)
def get_summary(analysis_id: str, db: Session = Depends(get_db)):
    cached = ai_insight_repo.get_summary(db, analysis_id)
    if cached:
        return AISummaryResponse(
            summary = cached.response,
            generated_at = cached.generated_at,
        )

    repository_info, analytics_dict, events_list = _get_context(db, analysis_id)

    summary = ai_assistant.generate_summary(
        repository = repository_info,
        analytics  = analytics_dict,
        events = events_list,
    )

    ai_insight_repo.create(
        db = db,
        repository_id = analysis_id,
        insight_type  = "summary",
        response = summary,
    )

    return AISummaryResponse(summary=summary, generated_at=datetime.utcnow())


@router.post("/{analysis_id}/chat", response_model=AIChatResponse)
def ask_question(
    analysis_id: str,
    request: AIChatRequest,
    db: Session = Depends(get_db),
): 
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    repository_info, analytics_dict, events_list = _get_context(db, analysis_id)

    result = ai_assistant.answer_question(
        question = question,
        repository = repository_info,
        analytics = analytics_dict,
        events = events_list,
    )

    ai_insight_repo.create(
        db            = db,
        repository_id = analysis_id,
        insight_type  = "question_answer",
        response = result["answer"],
        question = question,
    )

    return AIChatResponse(
        answer = result["answer"],
        insight_type = "question_answer",
        sources = result.get("sources", []),
        generated_at = datetime.utcnow(),
    )


@router.get("/{analysis_id}/insights")
def get_insights(analysis_id: str, db: Session = Depends(get_db)):
    insights = ai_insight_repo.get_all(db, analysis_id)
    return {
        "insights": [
            {
                "id": str(i.id),
                "insight_type": i.insight_type,
                "question": i.question,
                "response": i.response,
                "generated_at": i.generated_at.isoformat(),
            }
            for i in insights
        ],
        "total": len(insights),
    }