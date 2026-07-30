from sqlalchemy.orm import Session

from app.models import AIInsight
from app.config import settings
from app.utils import setup_logger

logger = setup_logger(__name__)


class AIInsightRepository:

    def create(
        self,
        db: Session,
        repository_id: str,
        insight_type: str,
        response: str,
        question: str | None = None,
    ) -> AIInsight:
        obj = AIInsight(
            repository_id = repository_id,
            insight_type  = insight_type,
            question = question,
            response = response,
            model_used = settings.OPENAI_MODEL,
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def get_summary(
        self, db: Session, repository_id: str
    ) -> AIInsight | None:
        return (
            db.query(AIInsight)
            .filter(
                AIInsight.repository_id == repository_id,
                AIInsight.insight_type  == "summary",
            )
            .order_by(AIInsight.generated_at.desc())
            .first()
        )

    def get_all(
        self, db: Session, repository_id: str
    ) -> list[AIInsight]:
        return (
            db.query(AIInsight)
            .filter(AIInsight.repository_id == repository_id)
            .order_by(AIInsight.generated_at.desc())
            .all()
        )