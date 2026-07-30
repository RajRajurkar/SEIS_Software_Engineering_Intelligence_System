import os
import git
from datetime import datetime
from typing import Any
from pydriller import Repository as PyDrillerRepo

from app.utils import setup_logger, extract_repo_info, safe_int
from app.config import settings

logger = setup_logger(__name__)


class GitMiner:

    def __init__(self, local_path: str, github_url: str):
        self.local_path = local_path
        self.github_url = github_url
        self.owner, self.name = extract_repo_info(github_url)


    def extract_all(self) -> dict[str, Any]: 
        logger.info(f"Starting mining for {self.owner}/{self.name}")

        metadata = self._extract_metadata()
        commits = self._extract_commits()
        contributors = self._aggregate_contributors(commits)
        branches = self._extract_branches()
        tags = self._extract_tags()
        languages = self._detect_languages()

        logger.info(
            f"Mining complete: {len(commits)} commits, "
            f"{len(contributors)} contributors"
        )

        return {
            "metadata": metadata,
            "commits": commits,
            "contributors": contributors,
            "branches": branches,
            "tags": tags,
            "languages": languages,
        }

    def _extract_metadata(self) -> dict[str, Any]:
        try:
            repo = git.Repo(self.local_path)
            try:
                branch = repo.active_branch.name
            except TypeError:
                branch = "main"

            description = ""
            try:
                with open(
                    os.path.join(self.local_path, ".git", "description"),
                    "r", encoding="utf-8", errors="ignore",
                ) as f:
                    description = f.read().strip()
                    if description.startswith("Unnamed repository"):
                        description = ""
            except FileNotFoundError:
                pass

            return {
                "owner": self.owner,
                "name": self.name,
                "github_url": self.github_url,
                "default_branch": branch,
                "description": description,
                "local_path": self.local_path,
            }
        except Exception as e:
            logger.warning(f"Could not extract full metadata: {e}")
            return {
                "owner": self.owner,
                "name": self.name,
                "github_url": self.github_url,
                "default_branch": "main",
                "description": "",
                "local_path": self.local_path,
            }

    def _extract_commits(self) -> list[dict[str, Any]]:
        commits = []
        max_commits = settings.MAX_COMMITS_PER_REPO

        try:
            for commit in PyDrillerRepo(self.local_path).traverse_commits():
                if len(commits) >= max_commits:
                    logger.warning(
                        f"Reached commit limit ({max_commits}). Stopping."
                    )
                    break

                modified_files = []
                try:
                    for f in commit.modified_files:
                        path = f.new_path or f.old_path or ""
                        if path:
                            modified_files.append(path)
                except Exception:
                    pass

                commits.append({
                    "hash": commit.hash,
                    "author_name": commit.author.name if commit.author    else "Unknown",
                    "author_email":   commit.author.email if commit.author    else "",
                    "committer_name": commit.committer.name if commit.committer else "Unknown",
                    "date": commit.author_date,
                    "message": commit.msg or "",
                    "insertions": safe_int(commit.insertions),
                    "deletions": safe_int(commit.deletions),
                    "files_changed":  safe_int(commit.files),
                    "modified_files": modified_files,
                })
        except Exception as e:
            logger.error(f"Error extracting commits: {e}")

        logger.info(f"Extracted {len(commits)} commits")
        return commits

    def _aggregate_contributors(
        self, commits: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        contributor_map: dict[str, dict[str, Any]] = {}

        for commit in commits:
            email = commit.get("author_email", "").lower().strip()
            name  = commit.get("author_name", "Unknown")
            key   = email or name.lower()

            if key not in contributor_map:
                contributor_map[key] = {
                    "name":          name,
                    "email":         email,
                    "commit_count":  0,
                    "insertions":    0,
                    "deletions":     0,
                    "files_changed": 0,
                    "first_commit":  None,
                    "last_commit":   None,
                    "files":         set(),
                }

            c = contributor_map[key]
            c["commit_count"]  += 1
            c["insertions"]    += commit.get("insertions", 0)
            c["deletions"]     += commit.get("deletions", 0)
            c["files_changed"] += commit.get("files_changed", 0)

            date = commit.get("date")
            if date:
                if c["first_commit"] is None or date < c["first_commit"]:
                    c["first_commit"] = date
                if c["last_commit"] is None or date > c["last_commit"]:
                    c["last_commit"] = date

            for f in commit.get("modified_files", []):
                c["files"].add(f)

        result = []
        for c in contributor_map.values():
            c["files"] = list(c["files"])
            result.append(c)

        result.sort(key=lambda x: x["commit_count"], reverse=True)
        return result

    def _extract_branches(self) -> list[str]:
        try:
            repo = git.Repo(self.local_path)
            return [b.name for b in repo.branches]
        except Exception as e:
            logger.warning(f"Could not extract branches: {e}")
            return []

    def _extract_tags(self) -> list[str]:
        try:
            repo = git.Repo(self.local_path)
            return [t.name for t in repo.tags]
        except Exception as e:
            logger.warning(f"Could not extract tags: {e}")
            return []

    def _detect_languages(self) -> dict[str, int]:
        extension_map = {
            ".py":    "Python",
            ".js":    "JavaScript",
            ".ts":    "TypeScript",
            ".jsx":   "JavaScript",
            ".tsx":   "TypeScript",
            ".java":  "Java",
            ".c":     "C",
            ".cpp":   "C++",
            ".cs":    "C#",
            ".go":    "Go",
            ".rs":    "Rust",
            ".rb":    "Ruby",
            ".php":   "PHP",
            ".swift": "Swift",
            ".kt":    "Kotlin",
            ".scala": "Scala",
            ".r":     "R",
            ".m":     "Objective-C",
            ".sh":    "Shell",
            ".html":  "HTML",
            ".css":   "CSS",
            ".scss":  "CSS",
            ".sql":   "SQL",
            ".md":    "Markdown",
            ".yml":   "YAML",
            ".yaml":  "YAML",
            ".json":  "JSON",
            ".xml":   "XML",
            ".dart":  "Dart",
            ".vue":   "Vue",
        }

        counts: dict[str, int] = {}

        try:
            for root, dirs, files in os.walk(self.local_path):
                dirs[:] = [
                    d for d in dirs
                    if not d.startswith(".")
                    and d not in {"node_modules", "__pycache__", "venv",
                                  ".git", "dist", "build", "vendor"}
                ]
                for fname in files:
                    _, ext = os.path.splitext(fname)
                    lang = extension_map.get(ext.lower())
                    if lang:
                        counts[lang] = counts.get(lang, 0) + 1
        except Exception as e:
            logger.warning(f"Could not detect languages: {e}")

        return counts