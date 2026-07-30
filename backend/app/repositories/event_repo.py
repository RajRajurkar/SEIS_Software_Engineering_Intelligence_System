from sqlalchemy.orm import Session

from app.models import EngineeringEvent
from app.utils import setup_logger

logger = setup_logger(__name__)


class EventRepository:

    def bulk_create(
        self, db: Session, repository_id: str, events: list[dict]
    ) -> int:
        objects = []
        for e in events:
            obj = EngineeringEvent(
                repository_id  = repository_id,
                event_type     = e.get("event_type", "Other"),
                module         = e.get("module", "Unknown"),
                summary        = e.get("summary", ""),
                author_name    = e.get("author_name"),
                author_email   = e.get("author_email"),
                event_date     = e.get("event_date"),
                confidence     = e.get("confidence", 1.0),
                files_changed  = e.get("files_changed", 0),
                commit_hash    = e.get("commit_hash", ""),
                commit_message = e.get("commit_message", "")[:500],
            )
            objects.append(obj)

        db.bulk_save_objects(objects)
        db.commit()
        logger.info(f"Inserted {len(objects)} events for {repository_id}")
        return len(objects)

    def get_by_repository(
        self,
        db:            Session,
        repository_id: str,
        limit:         int = 1000,
    ) -> list[EngineeringEvent]:
        return (
            db.query(EngineeringEvent)
            .filter(EngineeringEvent.repository_id == repository_id)
            .order_by(EngineeringEvent.event_date.desc())
            .limit(limit)
            .all()
        )

    def get_recent(
        self,
        db:            Session,
        repository_id: str,
        limit:         int = 20,
    ) -> list[EngineeringEvent]:
        return (
            db.query(EngineeringEvent)
            .filter(EngineeringEvent.repository_id == repository_id)
            .order_by(EngineeringEvent.event_date.desc())
            .limit(limit)
            .all()
        )