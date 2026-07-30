from sqlalchemy.orm import Session

from app.models import RepositoryAnalytics
from app.utils import setup_logger

logger = setup_logger(__name__)


class AnalyticsRepository:

    def create_or_update(
        self, db: Session, repository_id: str, analytics: dict
    ) -> RepositoryAnalytics:

        existing = (
            db.query(RepositoryAnalytics)
            .filter(RepositoryAnalytics.repository_id == repository_id)
            .first()
        )

        if existing:
            obj = existing
        else:
            obj = RepositoryAnalytics(repository_id=repository_id)
            db.add(obj)

        obj.total_commits = str(analytics.get("total_commits", 0))
        obj.total_contributors = str(analytics.get("total_contributors", 0))
        obj.total_files = str(analytics.get("total_files", 0))
        obj.total_branches = str(analytics.get("total_branches", 0))
        obj.total_insertions = str(analytics.get("total_insertions", 0))
        obj.total_deletions = str(analytics.get("total_deletions", 0))
        obj.first_commit_date  = analytics.get("first_commit_date")
        obj.last_commit_date = analytics.get("last_commit_date")

        obj.commit_timeline = analytics.get("commit_timeline", {})
        obj.repository_growth = analytics.get("repository_growth", {})
        obj.insertions_deletions  = analytics.get("insertions_deletions",  {})
        obj.language_distribution = analytics.get("language_distribution", {})
        obj.event_categories = analytics.get("event_categories", {})
        obj.module_activity = analytics.get("module_activity", [])
        obj.file_hotspots = analytics.get("file_hotspots", [])
        obj.contributor_ranking = analytics.get("contributor_ranking", [])
        obj.commit_activity = analytics.get("commit_activity", {})
        obj.release_stats = analytics.get("release_stats", {})
        obj.commits_by_day = {
            "labels": analytics.get("commits_by_day", []),
            "values": analytics.get("commits_by_day_values", []),
        }

        db.commit()
        db.refresh(obj)
        logger.info(f"Analytics saved for {repository_id}")
        return obj

    def get_by_repository(
        self, db: Session, repository_id: str
    ) -> RepositoryAnalytics | None:
        return (
            db.query(RepositoryAnalytics)
            .filter(RepositoryAnalytics.repository_id == repository_id)
            .first()
        )