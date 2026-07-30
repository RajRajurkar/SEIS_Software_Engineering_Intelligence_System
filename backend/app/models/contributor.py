import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Contributor(Base):
    __tablename__ = "contributors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    commit_count = Column(Integer, default=0)
    insertions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    files_changed = Column(Integer, default=0)
    first_commit = Column(DateTime, nullable=True)
    last_commit = Column(DateTime, nullable=True)
    modules = Column(JSON, default=list)

    repository = relationship("Repository", back_populates="contributors")

    def __repr__(self):
        return f"<Contributor {self.name} ({self.commit_count} commits)>"