import json
from typing import Any
from datetime import datetime

from openai import OpenAI

from app.config import settings
from app.utils import setup_logger, truncate_text

logger = setup_logger(__name__)


class AIAssistant:

    def __init__(self):
        if settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.client = None
            logger.warning("OPENAI_API_KEY not set — AI features disabled.")


    def generate_summary(
        self,
        repository:  dict[str, Any],
        analytics:   dict[str, Any],
        events:      list[dict[str, Any]],
    ) -> str:
        if not self.client:
            return self._offline_summary(repository, analytics)

        context = self._build_context(repository, analytics, events)
        prompt  = self._summary_prompt(context)

        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": self._system_prompt()},
                    {"role": "user",   "content": prompt},
                ],
                max_tokens=600,
                temperature=0.4,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"AI summary generation failed: {e}")
            return self._offline_summary(repository, analytics)

    def answer_question(
        self,
        question:    str,
        repository:  dict[str, Any],
        analytics:   dict[str, Any],
        events:      list[dict[str, Any]],
    ) -> dict[str, Any]:
        if not self.client:
            return {
                "answer":  self._offline_answer(question, analytics),
                "sources": ["Repository Analytics"],
            }

        context = self._build_context(repository, analytics, events)
        sources = self._identify_relevant_sources(question)
        prompt  = self._question_prompt(question, context)

        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": self._system_prompt()},
                    {"role": "user",   "content": prompt},
                ],
                max_tokens=800,
                temperature=0.3,
            )
            answer = response.choices[0].message.content.strip()
            return {"answer": answer, "sources": sources}
        except Exception as e:
            logger.error(f"AI question answering failed: {e}")
            return {
                "answer":  f"I encountered an issue generating a response: {str(e)}",
                "sources": [],
            }


    def _build_context(
        self,
        repository:  dict[str, Any],
        analytics:   dict[str, Any],
        events:      list[dict[str, Any]],
    ) -> str:
        
        lines = []

        lines.append(" REPOSITORY INFORMATION ")
        lines.append(f"Name: {repository.get('owner','')}/{repository.get('name','')}")
        lines.append(f"Description: {repository.get('description') or 'Not provided'}")
        lines.append(f"Primary Language: {repository.get('primary_language') or 'Unknown'}")
        lines.append(f"Default Branch: {repository.get('default_branch','main')}")

        lines.append("\n REPOSITORY METRICS ")
        lines.append(f"Total Commits: {analytics.get('total_commits', 0):,}")
        lines.append(f"Total Contributors: {analytics.get('total_contributors', 0)}")
        lines.append(f"Total Files: {analytics.get('total_files', 0):,}")
        lines.append(f"Total Branches: {analytics.get('total_branches', 0)}")
        lines.append(f"Total Insertions: {analytics.get('total_insertions', 0):,} lines added")
        lines.append(f"Total Deletions: {analytics.get('total_deletions', 0):,} lines removed")

        first = analytics.get("first_commit_date")
        last  = analytics.get("last_commit_date")
        if first:
            lines.append(f"First Commit: {first.strftime('%B %Y') if hasattr(first, 'strftime') else first}")
        if last:
            lines.append(f"Last Commit:  {last.strftime('%B %Y') if hasattr(last, 'strftime') else last}")

        lang_dist = analytics.get("language_distribution", {})
        if lang_dist:
            lines.append("\n LANGUAGE DISTRIBUTION ")
            for lang, pct in list(lang_dist.items())[:8]:
                lines.append(f"  {lang}: {pct}%")

        event_cats = analytics.get("event_categories", {})
        if event_cats:
            lines.append("\n ENGINEERING EVENT CATEGORIES ")
            total_events = sum(event_cats.values())
            for cat, count in list(event_cats.items())[:10]:
                pct = round((count / total_events) * 100) if total_events else 0
                lines.append(f"  {cat}: {count} events ({pct}%)")

        module_activity = analytics.get("module_activity", [])
        if module_activity:
            lines.append("\n  MODULE ACTIVITY (Top 10) ")
            for m in module_activity[:10]:
                lines.append(
                    f"  {m['name']}: {m['change_count']} changes"
                )

        contributors = analytics.get("contributor_ranking", [])
        if contributors:
            lines.append("\n  TOP CONTRIBUTORS ")
            for c in contributors[:8]:
                name = c.get("name") or c.get("email") or "Unknown"
                lines.append(f"  {name}: {c.get('commit_count', 0)} commits")

        if events:
            lines.append("\n RECENT ENGINEERING EVENTS (sample) ")
            for e in events[:15]:
                date_str = ""
                ed = e.get("event_date")
                if ed and hasattr(ed, "strftime"):
                    date_str = ed.strftime("%b %Y")
                lines.append(
                    f"  [{e.get('event_type','?')}] {e.get('module','?')} — "
                    f"{truncate_text(e.get('summary',''), 80)} ({date_str})"
                )

        return "\n".join(lines)


    def _system_prompt(self) -> str:
        return (
            "You are an expert Software Engineering Intelligence Assistant. "
            "You analyse Git repositories and provide clear, accurate engineering insights. "
            "You ONLY use the structured repository analytics provided to you. "
            "You NEVER invent statistics, numbers, or facts not present in the context. "
            "If information is insufficient, clearly state that. "
            "Your responses are professional, concise, and technically accurate. "
            "Use plain language that both developers and managers can understand."
        )

    def _summary_prompt(self, context: str) -> str:
        return (
            f"{context}\n\n"
            "=== TASK ===\n"
            "Generate a comprehensive engineering summary of this repository. Include:\n"
            "1. What the repository is about\n"
            "2. Scale and maturity (size, age, activity)\n"
            "3. Primary development focus (what types of changes dominate)\n"
            "4. Key contributors and their impact\n"
            "5. Most active areas of the codebase\n"
            "6. Observable engineering trends\n\n"
            "Keep the response clear, structured, and under 400 words."
        )

    def _question_prompt(self, question: str, context: str) -> str:
        return (
            f"{context}\n\n"
            "=== USER QUESTION ===\n"
            f"{question}\n\n"
            "=== INSTRUCTIONS ===\n"
            "Answer the question using ONLY the repository analytics above. "
            "Be specific with numbers and names where available. "
            "If the data does not contain enough information to answer confidently, "
            "say so clearly rather than guessing. "
            "Keep the response concise and technically accurate."
        )

    def _identify_relevant_sources(self, question: str) -> list[str]:
        q = question.lower()
        sources = []
        if any(w in q for w in ["contributor", "author", "developer", "who"]):
            sources.append("Contributor Analytics")
        if any(w in q for w in ["module", "component", "part", "area"]):
            sources.append("Module Analytics")
        if any(w in q for w in ["commit", "change", "frequency", "activity"]):
            sources.append("Commit Timeline")
        if any(w in q for w in ["language", "tech", "stack"]):
            sources.append("Language Distribution")
        if any(w in q for w in ["bug", "fix", "feature", "refactor", "event", "type"]):
            sources.append("Engineering Events")
        if any(w in q for w in ["release", "version", "tag"]):
            sources.append("Release Statistics")
        if not sources:
            sources.append("Repository Analytics")
        return sources


    def _offline_summary(
        self,
        repository:  dict[str, Any],
        analytics:   dict[str, Any],
    ) -> str:
        name   = f"{repository.get('owner','')}/{repository.get('name','')}"
        lang   = repository.get("primary_language") or "Unknown"
        commits = analytics.get("total_commits", 0)
        contribs = analytics.get("total_contributors", 0)
        top_module = ""
        ma = analytics.get("module_activity", [])
        if ma:
            top_module = f" The most active module is {ma[0]['name']}."

        return (
            f"{name} is a {lang} repository with {commits:,} commits "
            f"from {contribs} contributors.{top_module} "
            f"(AI summary unavailable — configure OPENAI_API_KEY for full insights.)"
        )

    def _offline_answer(self, question: str, analytics: dict[str, Any]) -> str:
        return (
            "The AI Engineering Assistant is currently unavailable. "
            "Please configure your OPENAI_API_KEY in the .env file to enable "
            "natural-language repository insights."
        )