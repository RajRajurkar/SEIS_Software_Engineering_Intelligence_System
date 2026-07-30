import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, DateTime, Integer, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Commit(Base):
    __tablename__ = "commits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id   = Column(UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True)

    commit_hash = Column(String(40),  nullable=False)
    author_name = Column(String(255), nullable=True)
    author_email = Column(String(255), nullable=True)
    committer_name  = Column(String(255), nullable=True)
    commit_date = Column(DateTime,    nullable=True, index=True)
    commit_message  = Column(Text,        nullable=True)

    insertions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    files_changed = Column(Integer, default=0)

    repository = relationship("Repository",      back_populates="commits")
    engineering_events = relationship("EngineeringEvent", back_populates="commit")

    def __repr__(self):
        return f"<Commit {self.commit_hash[:8]} by {self.author_name}>"