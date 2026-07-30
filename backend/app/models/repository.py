import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, DateTime, Boolean,
    Integer, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database.connection import Base


class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    github_url = Column(Text, nullable=False, unique=True, index=True)
    owner = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    default_branch   = Column(String(100), nullable=True, default="main")
    primary_language = Column(String(100), nullable=True)
    is_private = Column(Boolean, default=False)
    stars_count = Column(Integer, default=0)
    forks_count = Column(Integer, default=0)

    status = Column(
        SAEnum(AnalysisStatus),
        default=AnalysisStatus.PENDING,
        nullable=False,
    )
    current_stage = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    local_path = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    commits = relationship("Commit", back_populates="repository", cascade="all, delete-orphan")
    contributors = relationship("Contributor", back_populates="repository", cascade="all, delete-orphan")
    engineering_events = relationship("EngineeringEvent", back_populates="repository", cascade="all, delete-orphan")
    analytics = relationship("RepositoryAnalytics", back_populates="repository", cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="repository", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Repository {self.owner}/{self.name} [{self.status}]>"