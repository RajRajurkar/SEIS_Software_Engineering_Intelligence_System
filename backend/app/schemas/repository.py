from pydantic import BaseModel, HttpUrl, field_validator
from datetime import datetime
from uuid import UUID


class RepositorySubmitRequest(BaseModel):
    github_url: str

    @field_validator("github_url")
    @classmethod
    def validate_github_url(cls, v: str) -> str:
        v = v.strip().rstrip("/")
        if not v.startswith("https://github.com/"):
            raise ValueError("URL must start with https://github.com/")
        parts = v.replace("https://github.com/", "").split("/")
        if len(parts) < 2 or not parts[0] or not parts[1]:
            raise ValueError("URL must be in format https://github.com/owner/repo")
        return v

    class Config:
        json_schema_extra = {
            "example": {"github_url": "https://github.com/facebook/react"}
        }


class RepositoryStatusResponse(BaseModel):
    analysis_id: str
    status: str
    current_stage: str | None
    github_url: str | None
    repository_name:  str | None
    started_at: datetime | None
    completed_at: datetime | None
    error_message: str | None

    class Config:
        from_attributes = True


class RepositoryResponse(BaseModel):
    id: str
    github_url: str
    owner: str | None
    name: str | None
    description: str | None
    default_branch:   str | None
    primary_language: str | None
    status: str
    created_at: datetime | None
    completed_at: datetime | None
    total_commits: int | None
    total_contributors: int | None

    class Config:
        from_attributes = True


class RepositoryListResponse(BaseModel):
    repositories: list[RepositoryResponse]
    total: int


class AnalyzeResponse(BaseModel):
    analysis_id: str
    status: str
    message: str