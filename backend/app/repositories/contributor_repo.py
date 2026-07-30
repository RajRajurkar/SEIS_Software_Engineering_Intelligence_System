from sqlalchemy.orm import Session

from app.models import Contributor
from app.utils import setup_logger

logger = setup_logger(__name__)


class ContributorRepository:

    def bulk_create(
        self, db: Session, repository_id: str, contributors: list[dict]
    ) -> int:
        objects = []
        for c in contributors:
            obj = Contributor(
                repository_id = repository_id,
                name = c.get("name"),
                email = c.get("email"),
                commit_count  = c.get("commit_count", 0),
                insertions = c.get("insertions",   0),
                deletions = c.get("deletions",    0),
                files_changed = c.get("files_changed",0),
                first_commit = c.get("first_commit"),
                last_commit = c.get("last_commit"),
                modules = c.get("modules", []),
            )
            objects.append(obj)

        db.bulk_save_objects(objects)
        db.commit()
        logger.info(f"Inserted {len(objects)} contributors for {repository_id}")
        return len(objects)

    def get_by_repository(
        self, db: Session, repository_id: str
    ) -> list[Contributor]:
        return (
            db.query(Contributor)
            .filter(Contributor.repository_id == repository_id)
            .order_by(Contributor.commit_count.desc())
            .all()
        )