from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PredictionRequest(BaseModel):
    farm_location: str
    farm_size: float
    growing_season: str
    water_availability: str
    soil_type: str
    ph: float
    n: float
    p: float
    k: float
    temperature: float
    humidity: float
    rainfall: float

class PredictionResponseItem(BaseModel):
    crop: str
    confidence: float
    explanation: str

class PredictionResponse(BaseModel):
    predictions: List[PredictionResponseItem]

class HistoryResponse(BaseModel):
    id: int
    crop_name: str
    confidence: float
    location: str
    season: str
    temperature: float
    rainfall: float
    date: datetime

    class Config:
        from_attributes = True
