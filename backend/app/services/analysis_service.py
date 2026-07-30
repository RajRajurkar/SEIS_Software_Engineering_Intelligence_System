import os
import git
import shutil
from datetime import datetime
from typing import Any
from sqlalchemy.orm import Session

from app.models import AnalysisStatus
from app.mining import GitMiner
from app.evolution import EvolutionProcessor
from app.analytics import AnalyticsEngine
from app.ai import AIAssistant
from app.repositories import (
    RepositoryRepository,
    CommitRepository,
    ContributorRepository,
    EventRepository,
    AnalyticsRepository,
    AIInsightRepository,
)
from app.config import settings
from app.utils import setup_logger, extract_repo_info, clean_temp_directory

logger = setup_logger(__name__)

_repo_repo = RepositoryRepository()
_commit_repo = CommitRepository()
_contrib_repo   = ContributorRepository()
_event_repo = EventRepository()
_analytics_repo = AnalyticsRepository()
_ai_repo = AIInsightRepository()
_ai_assistant   = AIAssistant()
_processor = EvolutionProcessor()
_analytics_eng  = AnalyticsEngine()


class AnalysisService:
    """
    1. Clone repository
    2. Mine Git history
    3. Process engineering events
    4. Calculate analytics
    5. Store all data
    6. Generate AI insights
    """

    def run_analysis(self, db: Session, repository_id: str) -> None:
        logger.info(f"Starting analysis pipeline for {repository_id}")

        repo = _repo_repo.get_by_id(db, repository_id)
        if not repo:
            logger.error(f"Repository {repository_id} not found")
            return

        local_path = None

        try:
            self._set_stage(db, repository_id, AnalysisStatus.RUNNING, "cloning")
            local_path = self._clone_repository(repo.github_url, repository_id)
            _repo_repo.update_metadata(db, repository_id, {"local_path": local_path})

            self._set_stage(db, repository_id, AnalysisStatus.RUNNING, "mining")
            miner = GitMiner(local_path, repo.github_url)
            raw_data = miner.extract_all()

            meta = raw_data["metadata"]
            _repo_repo.update_metadata(db, repository_id, {
                "owner": meta.get("owner"),
                "name": meta.get("name"),
                "description": meta.get("description"),
                "default_branch": meta.get("default_branch"),
                "primary_language": self._detect_primary_language(raw_data["languages"]),
            })

            _commit_repo.bulk_create(db, repository_id, raw_data["commits"])
            _contrib_repo.bulk_create(db, repository_id, raw_data["contributors"])

            self._set_stage(db, repository_id, AnalysisStatus.RUNNING, "processing")
            events = _processor.process(raw_data["commits"])

            self._enrich_contributor_modules(
                raw_data["contributors"], events
            )
            _event_repo.bulk_create(db, repository_id, events)

            self._set_stage(db, repository_id, AnalysisStatus.RUNNING, "analytics")
            analytics = _analytics_eng.compute(
                commits      = raw_data["commits"],
                events       = events,
                contributors = raw_data["contributors"],
                branches     = raw_data["branches"],
                tags         = raw_data["tags"],
                languages    = raw_data["languages"],
            )

            self._set_stage(db, repository_id, AnalysisStatus.RUNNING, "storing")
            _analytics_repo.create_or_update(db, repository_id, analytics)

            self._set_stage(db, repository_id, AnalysisStatus.RUNNING, "ai")
            repo_obj = _repo_repo.get_by_id(db, repository_id)
            repository_info = {
                "owner": repo_obj.owner,
                "name": repo_obj.name,
                "description": repo_obj.description,
                "primary_language": repo_obj.primary_language,
                "default_branch": repo_obj.default_branch,
            }

            summary = _ai_assistant.generate_summary(
                repository = repository_info,
                analytics = analytics,
                events = events[:50],
            )
            _ai_repo.create(
                db = db,
                repository_id = repository_id,
                insight_type = "summary",
                response = summary,
            )

            self._set_stage(db, repository_id, AnalysisStatus.COMPLETED, "completed")
            logger.info(f"Analysis complete for {repository_id}")

        except Exception as e:
            logger.error(f"Analysis failed for {repository_id}: {e}", exc_info=True)
            _repo_repo.update_status(
                db, repository_id,
                AnalysisStatus.FAILED,
                error_message=str(e),
            )
        finally:
            if local_path and os.path.exists(local_path):
                clean_temp_directory(local_path)
                logger.info(f"Cleaned up temp directory: {local_path}")


    def _set_stage(
        self,
        db: Session,
        repository_id: str,
        status: AnalysisStatus,
        stage: str,
    ) -> None:
        _repo_repo.update_status(db, repository_id, status, current_stage=stage)
        logger.info(f"Stage [{stage}] for {repository_id}")

    def _clone_repository(self, github_url: str, repository_id: str) -> str:
        os.makedirs(settings.TEMP_REPOS_PATH, exist_ok=True)
        local_path = os.path.join(settings.TEMP_REPOS_PATH, str(repository_id))

        if os.path.exists(local_path):
            shutil.rmtree(local_path)

        logger.info(f"Cloning {github_url} → {local_path}")
        git.Repo.clone_from(
            github_url,
            local_path,
            multi_options=["--no-tags"],
        )
        logger.info("Clone complete")
        return local_path

    def _detect_primary_language(self, languages: dict[str, int]) -> str | None:
        if not languages:
            return None
        return max(languages, key=languages.get)

    def _enrich_contributor_modules(
        self,
        contributors: list,
        events: list,
    ) -> None:
        email_modules: dict[str, set] = {}
        for event in events:
            email = (event.get("author_email") or "").lower()
            mod   = event.get("module", "")
            if email and mod and mod not in ("Unknown", "Core", "Other"):
                if email not in email_modules:
                    email_modules[email] = set()
                email_modules[email].add(mod)

        for contrib in contributors:
            email = (contrib.get("email") or "").lower()
            mods  = list(email_modules.get(email, set()))
            contrib["modules"] = sorted(mods)[:10] 


analysis_service = AnalysisService()