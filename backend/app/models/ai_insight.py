import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.connection import Base


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True)

    insight_type = Column(String(100), nullable=False, index=True)
    question = Column(Text, nullable=True)
    response = Column(Text, nullable=False)
    model_used = Column(String(100), nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="ai_insights")

    def __repr__(self):
        return f"<AIInsight {self.insight_type}>"