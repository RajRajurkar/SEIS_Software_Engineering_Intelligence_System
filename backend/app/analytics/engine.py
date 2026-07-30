from collections import defaultdict
from datetime import datetime
from typing import Any
import calendar

from app.utils import setup_logger

logger = setup_logger(__name__)


class AnalyticsEngine:
    def compute(
        self,
        commits: list[dict[str, Any]],
        events: list[dict[str, Any]],
        contributors: list[dict[str, Any]],
        branches: list[str],
        tags: list[str],
        languages: dict[str, int],
    ) -> dict[str, Any]:

        logger.info("Computing repository analytics…")

        analytics = {
            "commit_timeline": self._commit_timeline(commits),
            "repository_growth": self._repository_growth(commits),
            "insertions_deletions": self._insertions_deletions(commits),

            "language_distribution": self._language_distribution(languages),
            "event_categories": self._event_categories(events),
            "commits_by_day": self._commits_by_day_labels(),
            "commits_by_day_values": self._commits_by_day_values(commits),

            "module_activity": self._module_activity(events),
            "file_hotspots": self._file_hotspots(commits),
            "contributor_ranking": self._contributor_ranking(contributors),

            "release_stats": self._release_stats(tags, commits),

            "commit_activity": self._commit_timeline(commits),

            "total_commits": len(commits),
            "total_contributors": len(contributors),
            "total_branches": len(branches),
            "total_files": self._count_unique_files(commits),
            "total_insertions": sum(c.get("insertions", 0) for c in commits),
            "total_deletions": sum(c.get("deletions",  0) for c in commits),
            "first_commit_date": self._first_date(commits),
            "last_commit_date": self._last_date(commits),
        }

        logger.info("Analytics computation complete.")
        return analytics


    def _commit_timeline(self, commits: list[dict[str, Any]]) -> dict[str, Any]:
        monthly: dict[str, int] = defaultdict(int)
        for c in commits:
            date = c.get("date")
            if date:
                key = date.strftime("%Y-%m")
                monthly[key] += 1

        sorted_keys = sorted(monthly)
        return {
            "labels": [self._format_month(k) for k in sorted_keys],
            "values": [monthly[k] for k in sorted_keys],
        }

    def _repository_growth(self, commits: list[dict[str, Any]]) -> dict[str, Any]:
        monthly: dict[str, int] = defaultdict(int)
        for c in commits:
            date = c.get("date")
            if date:
                monthly[date.strftime("%Y-%m")] += 1

        sorted_keys = sorted(monthly)
        cumulative, total = [], 0
        for k in sorted_keys:
            total += monthly[k]
            cumulative.append(total)

        return {
            "labels": [self._format_month(k) for k in sorted_keys],
            "values": cumulative,
        }

    def _insertions_deletions(self, commits: list[dict[str, Any]]) -> dict[str, Any]:
        ins:  dict[str, int] = defaultdict(int)
        dels: dict[str, int] = defaultdict(int)

        for c in commits:
            date = c.get("date")
            if date:
                key = date.strftime("%Y-%m")
                ins[key]  += c.get("insertions", 0)
                dels[key] += c.get("deletions",  0)

        sorted_keys = sorted(set(ins) | set(dels))
        return {
            "labels":     [self._format_month(k) for k in sorted_keys],
            "insertions": [ins[k]  for k in sorted_keys],
            "deletions":  [dels[k] for k in sorted_keys],
        }


    def _language_distribution(
        self, languages: dict[str, int]
    ) -> dict[str, float]:
        total = sum(languages.values())
        if not total:
            return {}
        return {
            lang: round((count / total) * 100, 1)
            for lang, count in sorted(
                languages.items(), key=lambda x: x[1], reverse=True
            )
        }

    def _event_categories(
        self, events: list[dict[str, Any]]
    ) -> dict[str, int]:
        """Count events per category."""
        counts: dict[str, int] = defaultdict(int)
        for e in events:
            counts[e.get("event_type", "Other")] += 1
        return dict(sorted(counts.items(), key=lambda x: x[1], reverse=True))

    def _commits_by_day_labels(self) -> list[str]:
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    def _commits_by_day_values(self, commits: list[dict[str, Any]]) -> list[int]:
        """Count commits per day of week (Mon=0 … Sun=6)."""
        counts = [0] * 7
        for c in commits:
            date = c.get("date")
            if date:
                counts[date.weekday()] += 1
        return counts


    def _module_activity(
        self, events: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        module_stats: dict[str, dict[str, int]] = defaultdict(
            lambda: {"change_count": 0, "insertions": 0, "deletions": 0}
        )
        for e in events:
            mod = e.get("module") or "Unknown"
            module_stats[mod]["change_count"] += 1

        result = [
            {"name": mod, **stats}
            for mod, stats in module_stats.items()
        ]
        return sorted(result, key=lambda x: x["change_count"], reverse=True)[:20]

    def _file_hotspots(
        self, commits: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        file_stats: dict[str, dict[str, int]] = defaultdict(
            lambda: {"change_count": 0, "insertions": 0, "deletions": 0}
        )
        for c in commits:
            ins  = c.get("insertions", 0)
            dels = c.get("deletions",  0)
            files = c.get("modified_files", [])
            n = len(files) if files else 1
            per_file_ins  = ins  // n if n else 0
            per_file_dels = dels // n if n else 0

            for f in files:
                file_stats[f]["change_count"] += 1
                file_stats[f]["insertions"] += per_file_ins
                file_stats[f]["deletions"] += per_file_dels

        result = [
            {"file_path": fp, **stats}
            for fp, stats in file_stats.items()
        ]
        return sorted(result, key=lambda x: x["change_count"], reverse=True)[:30]

    def _contributor_ranking(
        self, contributors: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        return sorted(
            contributors,
            key=lambda x: x.get("commit_count", 0),
            reverse=True,
        )


    def _release_stats(
        self, tags: list[str], commits: list[dict[str, Any]]
    ) -> dict[str, Any]:
        if not tags:
            return {
                "total_releases": 0,
                "latest_release": None,
                "first_release": None,
                "avg_days_between_releases": None,
            }

        version_tags = [
            t for t in tags
            if any(c.isdigit() for c in t)
        ]

        return {
            "total_releases": len(version_tags),
            "latest_release": version_tags[-1] if version_tags else tags[-1],
            "first_release": version_tags[0]  if version_tags else tags[0],
            "avg_days_between_releases": None, 
        }


    def _count_unique_files(self, commits: list[dict[str, Any]]) -> int:
        unique: set = set()
        for c in commits:
            for f in c.get("modified_files", []):
                unique.add(f)
        return len(unique)

    def _first_date(
        self, commits: list[dict[str, Any]]
    ) -> datetime | None:
        dates = [c["date"] for c in commits if c.get("date")]
        return min(dates) if dates else None

    def _last_date(
        self, commits: list[dict[str, Any]]
    ) -> datetime | None:
        dates = [c["date"] for c in commits if c.get("date")]
        return max(dates) if dates else None

    @staticmethod
    def _format_month(ym: str) -> str:
        try:
            dt = datetime.strptime(ym, "%Y-%m")
            return dt.strftime("%b %Y")
        except ValueError:
            return ym