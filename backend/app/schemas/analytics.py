from pydantic import BaseModel
from typing import Any
from datetime import datetime


class TimeSeriesData(BaseModel):
    labels: list[str]
    values: list[float]


class ContributorAnalyticsItem(BaseModel):
    name: str | None
    email: str | None
    commit_count: int
    insertions:   int
    deletions: int
    first_commit: datetime | None
    last_commit:  datetime | None
    modules: list[str]


class ModuleActivityItem(BaseModel):
    name: str
    change_count: int
    insertions: int
    deletions: int


class FileHotspotItem(BaseModel):
    file_path: str
    change_count: int
    insertions: int
    deletions: int


class DashboardOverviewResponse(BaseModel):
    total_commits: int
    total_contributors: int
    total_files: int
    total_branches: int
    total_insertions: int
    total_deletions: int
    first_commit_date: datetime | None
    last_commit_date: datetime | None
    primary_language: str | None
    commit_activity: dict[str, Any]
    language_distribution: dict[str, float]
    event_categories: dict[str, int]
    top_contributors: list[dict[str, Any]]
    top_modules: list[dict[str, Any]]
    recent_events: list[dict[str, Any]]


class RepositoryAnalyticsResponse(BaseModel):
    total_commits: int
    total_contributors: int
    total_files: int
    total_insertions: int
    total_deletions: int
    first_commit_date: datetime | None
    last_commit_date: datetime | None
    commit_timeline: dict[str, Any]
    repository_growth: dict[str, Any]
    insertions_deletions: dict[str, Any]
    language_distribution: dict[str, float]
    event_categories: dict[str, int]
    module_activity: list[dict[str, Any]]
    file_hotspots: list[dict[str, Any]]
    commits_by_day: list[str]
    commits_by_day_values: list[int]
    release_stats: dict[str, Any] | None


class ContributorAnalyticsResponse(BaseModel):
    contributors: list[dict[str, Any]]
    total: int


class ModuleAnalyticsResponse(BaseModel):
    modules: list[dict[str, Any]]
    total:   int


class TimelineAnalyticsResponse(BaseModel):
    events: list[dict[str, Any]]
    total: int