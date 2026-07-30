from pydantic_settings import BaseSettings
from pydantic import field_validator
import os


class Settings(BaseSettings):
    APP_NAME: str = "Software Engineering Intelligence System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = "change_this_in_production"

    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/seis_db"

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    FRONTEND_URL: str = "http://localhost:5173"

    TEMP_REPOS_PATH: str = "./temp_repos"
    MAX_REPO_SIZE_MB: int = 500
    MAX_COMMITS_PER_REPO: int = 10000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        return [
            self.FRONTEND_URL,
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ]


settings = Settings()