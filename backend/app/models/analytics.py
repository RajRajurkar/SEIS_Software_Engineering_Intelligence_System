import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database.connection import Base

class RepositoryAnalytics(Base):
    __tablename__ = "repository_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True, unique=True)

    commit_timeline = Column(JSONB, default=dict)
    repository_growth = Column(JSONB, default=dict)
    insertions_deletions = Column(JSONB, default=dict)
    language_distribution = Column(JSONB, default=dict)
    event_categories = Column(JSONB, default=dict)
    module_activity = Column(JSONB, default=list)
    file_hotspots = Column(JSONB, default=list)
    contributor_ranking  = Column(JSONB, default=list)
    commit_activity = Column(JSONB, default=dict)
    release_stats = Column(JSONB, default=dict)
    commits_by_day = Column(JSONB, default=dict)

    total_commits = Column(String(20), default="0")
    total_contributors = Column(String(20), default="0")
    total_files = Column(String(20), default="0")
    total_branches = Column(String(20), default="0")
    total_insertions = Column(String(20), default="0")
    total_deletions = Column(String(20), default="0")
    first_commit_date = Column(DateTime, nullable=True)
    last_commit_date = Column(DateTime, nullable=True)

    generated_at = Column(DateTime, default=datetime.utcnow)

    repository = relationship("Repository", back_populates="analytics")

    def __repr__(self):
        return f"<RepositoryAnalytics for {self.repository_id}>"