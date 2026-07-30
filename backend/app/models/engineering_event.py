import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.connection import Base


class EngineeringEvent(Base):
    __tablename__ = "engineering_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True)
    commit_id = Column(UUID(as_uuid=True), ForeignKey("commits.id", ondelete="CASCADE"), nullable=True)

    event_type = Column(String(100), nullable=False, index=True)
    module = Column(String(255), nullable=True,  index=True)
    summary = Column(Text, nullable=True)
    author_name = Column(String(255), nullable=True)
    author_email = Column(String(255), nullable=True)
    event_date = Column(DateTime, nullable=True, index=True)
    confidence = Column(Float, default=1.0)
    files_changed = Column(Integer, default=0)
    commit_hash = Column(String(40),  nullable=True)
    commit_message  = Column(Text, nullable=True)

    repository = relationship("Repository", back_populates="engineering_events")
    commit = relationship("Commit", back_populates="engineering_events")

    def __repr__(self):
        return f"<EngineeringEvent {self.event_type} [{self.module}]>"