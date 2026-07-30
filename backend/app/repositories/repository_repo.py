from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session

from app.models import Repository, AnalysisStatus
from app.utils import setup_logger

logger = setup_logger(__name__)


class RepositoryRepository:

    def create(self, db: Session, github_url: str, owner: str, name: str) -> Repository:
        repo = Repository(
            github_url = github_url,
            owner      = owner,
            name       = name,
            status     = AnalysisStatus.PENDING,
        )
        db.add(repo)
        db.commit()
        db.refresh(repo)
        logger.info(f"Created repository record: {owner}/{name}")
        return repo

    def get_by_id(self, db: Session, repo_id: str) -> Repository | None:
        return db.query(Repository).filter(Repository.id == repo_id).first()

    def get_by_url(self, db: Session, github_url: str) -> Repository | None:
        return db.query(Repository).filter(Repository.github_url == github_url).first()

    def get_all(self, db: Session, limit: int = 100) -> list[Repository]:
        return (
            db.query(Repository)
            .order_by(Repository.created_at.desc())
            .limit(limit)
            .all()
        )

    def update_status(
        self,
        db:            Session,
        repo_id:       str,
        status:        AnalysisStatus,
        current_stage: str | None  = None,
        error_message: str | None  = None,
    ) -> Repository | None:
        repo = self.get_by_id(db, repo_id)
        if not repo:
            return None

        repo.status = status
        if current_stage is not None:
            repo.current_stage = current_stage
        if error_message is not None:
            repo.error_message = error_message
        if status == AnalysisStatus.RUNNING and not repo.started_at:
            repo.started_at = datetime.utcnow()
        if status in (AnalysisStatus.COMPLETED, AnalysisStatus.FAILED):
            repo.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(repo)
        return repo

    def update_metadata(
        self,
        db:       Session,
        repo_id:  str,
        metadata: dict,
    ) -> Repository | None:
        repo = self.get_by_id(db, repo_id)
        if not repo:
            return None
        for key, value in metadata.items():
            if hasattr(repo, key):
                setattr(repo, key, value)
        db.commit()
        db.refresh(repo)
        return repo

    def delete(self, db: Session, repo_id: str) -> bool:
        repo = self.get_by_id(db, repo_id)
        if not repo:
            return False
        db.delete(repo)
        db.commit()
        return True