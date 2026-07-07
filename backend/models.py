from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    
    predictions = relationship("PredictionHistory", back_populates="user")


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    crop_name = Column(String, index=True)
    confidence = Column(Float)
    location = Column(String)
    season = Column(String)
    temperature = Column(Float)
    rainfall = Column(Float)
    date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Store the input data for reference
    farm_size = Column(Float)
    water_availability = Column(String)
    soil_type = Column(String)
    ph = Column(Float)
    n = Column(Float)
    p = Column(Float)
    k = Column(Float)
    humidity = Column(Float)

    user = relationship("User", back_populates="predictions")
