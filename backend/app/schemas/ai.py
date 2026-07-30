from pydantic import BaseModel
from datetime import datetime


class AIChatRequest(BaseModel):
    question: str

    class Config:
        json_schema_extra = {
            "example": {"question": "Which module changed the most?"}
        }


class AIChatResponse(BaseModel):
    answer: str
    insight_type: str
    sources: list[str]
    generated_at: datetime


class AISummaryResponse(BaseModel):
    summary: str
    generated_at: datetime


class AIInsightResponse(BaseModel):
    id: str
    insight_type: str
    question: str | None
    response: str
    generated_at: datetime