from sqlalchemy.orm import Session

from app.models import Commit
from app.utils import setup_logger

logger = setup_logger(__name__)


class CommitRepository:

    def bulk_create(
        self, db: Session, repository_id: str, commits: list[dict]
    ) -> int:
        objects = []
        for c in commits:
            obj = Commit(
                repository_id  = repository_id,
                commit_hash    = c.get("hash", ""),
                author_name    = c.get("author_name"),
                author_email   = c.get("author_email"),
                committer_name = c.get("committer_name"),
                commit_date    = c.get("date"),
                commit_message = c.get("message", "")[:2000],
                insertions     = c.get("insertions", 0),
                deletions      = c.get("deletions",  0),
                files_changed  = c.get("files_changed", 0),
            )
            objects.append(obj)

        db.bulk_save_objects(objects)
        db.commit()
        logger.info(f"Inserted {len(objects)} commits for {repository_id}")
        return len(objects)

    def get_by_repository(
        self, db: Session, repository_id: str, limit: int = 10000
    ) -> list[Commit]:
        return (
            db.query(Commit)
            .filter(Commit.repository_id == repository_id)
            .order_by(Commit.commit_date.desc())
            .limit(limit)
            .all()
        )