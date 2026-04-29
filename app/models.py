import datetime
from pydantic import BaseModel, Field, model_validator

class Entry(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    task_description: str = Field(..., description="Description of the work")
    start_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$", description="Start time in HH:MM format")
    end_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$", description="End time in HH:MM format")
    rating: int = Field(10, ge=1, le=10, description="Rating from 1 to 10 (default: 10)")

    @model_validator(mode='after')
    def check_time_order(self) -> 'Entry':
        start_dt = datetime.datetime.strptime(self.start_time, "%H:%M")
        end_dt = datetime.datetime.strptime(self.end_time, "%H:%M")

        if end_dt <= start_dt:
            raise ValueError(f"end_time ({self.end_time}) must be strictly after start_time ({self.start_time})")

        return self
