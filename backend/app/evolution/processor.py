from typing import Any
from datetime import datetime

from app.utils import setup_logger, classify_commit_message, truncate_text

logger = setup_logger(__name__)


class EvolutionProcessor:
    

    def process(self, commits: list[dict[str, Any]]) -> list[dict[str, Any]]:
        
        events = []

        for commit in commits:
            try:
                event = self._process_single_commit(commit)
                events.append(event)
            except Exception as e:
                logger.warning(f"Could not process commit {commit.get('hash','?')[:8]}: {e}")

        logger.info(f"Generated {len(events)} engineering events from {len(commits)} commits")

        self._enrich_with_module_info(events)

        return events


    def _process_single_commit(self, commit: dict[str, Any]) -> dict[str, Any]:
        message = commit.get("message", "")
        event_type, module, confidence = classify_commit_message(message)

        if module in ("Core", "Unknown") and commit.get("modified_files"):
            module = self._detect_module_from_files(
                commit["modified_files"]
            ) or module

        return {
            "commit_hash": commit.get("hash", ""),
            "commit_message": truncate_text(message, 500),
            "event_type": event_type,
            "module": module,
            "confidence": confidence,
            "author_name": commit.get("author_name", "Unknown"),
            "author_email": commit.get("author_email", ""),
            "event_date": commit.get("date"),
            "files_changed": commit.get("files_changed", 0),
            "summary": self._generate_summary(event_type, module, message),
        }

    def _detect_module_from_files(self, files: list[str]) -> str:
       
        if not files:
            return ""

        skip = {"src", "lib", "app", "main", "core", "pkg", "internal",
                 "tests", "test", "__tests__", "spec", "docs", "assets",
                 "static", "public", "scripts", "tools", "config", "."}

        segment_count: dict[str, int] = {}
        for file_path in files:
            parts = file_path.replace("\\", "/").split("/")
            for part in parts[:-1]: 
                clean = part.strip().lower()
                if clean and clean not in skip and not clean.startswith("."):
                    segment_count[clean] = segment_count.get(clean, 0) + 1

        if not segment_count:
            return ""

        best = max(segment_count, key=segment_count.get)
        return best.replace("-", " ").replace("_", " ").title()

    def _generate_summary(
        self, event_type: str, module: str, message: str
    ) -> str:
        first_line = message.split("\n")[0].strip() if message else ""
        if len(first_line) > 120:
            first_line = first_line[:120] + "…"

        templates = {
            "Feature": f"New feature added to {module}: {first_line}",
            "Bug Fix": f"Bug fixed in {module}: {first_line}",
            "Refactoring": f"Code refactored in {module}: {first_line}",
            "Documentation": f"Documentation updated for {module}: {first_line}",
            "Testing": f"Tests added or updated in {module}: {first_line}",
            "Dependency Update":f"Dependency updated: {first_line}",
            "Configuration": f"Configuration changed: {first_line}",
            "Release": f"Release activity: {first_line}",
            "Other": first_line,
        }
        return templates.get(event_type, first_line)

    def _enrich_with_module_info(
        self, events: list[dict[str, Any]]
    ) -> None:
        # Nothing needed here at the event level;
        # contributor module aggregation happens in the analytics engine.
        pass