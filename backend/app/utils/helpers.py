import re
import os
import shutil
from datetime import datetime


def extract_repo_info(github_url: str) -> tuple[str, str]:
    """Extract owner and repo name from a GitHub URL."""
    url = github_url.strip().rstrip("/")
    url = url.replace("https://github.com/", "")
    url = url.replace("http://github.com/", "")
    parts = url.split("/")
    owner = parts[0] if len(parts) > 0 else "unknown"
    name  = parts[1] if len(parts) > 1 else "unknown"
    # Remove .git suffix if present
    name  = name.replace(".git", "")
    return owner, name


def classify_commit_message(message: str) -> tuple[str, str, float]:
    if not message:
        return "Other", "Unknown", 0.5

    msg = message.strip().lower()
    first_line = msg.split("\n")[0]

    conventional = re.match(
        r"^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)"
        r"(?:\(([^)]+)\))?[!]?:\s*(.+)",
        first_line,
    )
    if conventional:
        prefix, scope, _ = conventional.groups()
        module = scope.strip().title() if scope else "Core"

        type_map = {
            "feat":     ("Feature",          0.95),
            "fix":      ("Bug Fix",          0.95),
            "docs":     ("Documentation",    0.95),
            "style":    ("Refactoring",      0.85),
            "refactor": ("Refactoring",      0.95),
            "test":     ("Testing",          0.95),
            "chore":    ("Configuration",    0.90),
            "perf":     ("Refactoring",      0.90),
            "ci":       ("Configuration",    0.90),
            "build":    ("Configuration",    0.90),
            "revert":   ("Bug Fix",          0.85),
        }
        event_type, confidence = type_map.get(prefix, ("Other", 0.7))
        return event_type, module, confidence

    keyword_rules = [
        # Bug Fix
        (["fix", "bug", "error", "issue", "crash", "patch",
          "resolve", "hotfix", "regression"], "Bug Fix", 0.80),
        # Feature
        (["add", "feat", "feature", "implement", "new",
          "create", "introduce", "support"], "Feature", 0.75),
        # Documentation
        (["doc", "docs", "readme", "changelog", "comment",
          "document", "wiki", "guide"], "Documentation", 0.85),
        # Refactoring
        (["refactor", "clean", "cleanup", "reorgani", "restructure",
          "rename", "move", "extract", "simplif"], "Refactoring", 0.80),
        # Testing
        (["test", "spec", "unit", "integration", "coverage",
          "assert", "mock", "fixture"], "Testing", 0.85),
        # Dependency
        (["depend", "package", "library", "upgrade", "update",
          "bump", "version", "npm", "pip", "requirements"], "Dependency Update", 0.80),
        # Release
        (["release", "version", "tag", "deploy", "publish",
          "ship", "launch", "milestone"], "Release", 0.85),
        # Configuration
        (["config", "setting", "env", "environment", "docker",
          "ci", "workflow", "pipeline", "lint", "format"], "Configuration", 0.80),
    ]

    for keywords, event_type, confidence in keyword_rules:
        for kw in keywords:
            if kw in first_line:
                module = _extract_module_from_message(first_line) or "Core"
                return event_type, module, confidence

    if first_line.startswith("merge"):
        return "Configuration", "Core", 0.70

    return "Other", _extract_module_from_message(first_line) or "Core", 0.50


def _extract_module_from_message(message: str) -> str | None:
    patterns = [
        r"\(([^)]+)\)",   
        r"\[([^\]]+)\]",     
        r"^(\w+):",    
        r"in (\w+)", 
        r"(?:the |a |an )?(\w+) module",  
    ]
    for pattern in patterns:
        m = re.search(pattern, message.lower())
        if m:
            candidate = m.group(1).strip().title()
            if len(candidate) > 1 and candidate.lower() not in {
                "the", "a", "an", "this", "that",
            }:
                return candidate
    return None


def clean_temp_directory(path: str) -> None:
    if path and os.path.exists(path):
        shutil.rmtree(path, ignore_errors=True)

def safe_int(value, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

def truncate_text(text: str, max_length: int = 200) -> str:
    if not text:
        return ""
    return text[:max_length] + "…" if len(text) > max_length else text