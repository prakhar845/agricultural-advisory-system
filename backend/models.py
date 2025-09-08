from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Farmer(Base):
    __tablename__ = "farmers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(15), nullable=False)
    location = Column(String(200), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    farms = relationship("Farm", back_populates="farmer")

class Farm(Base):
    __tablename__ = "farms"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    name = Column(String(100), nullable=False)
    size_acres = Column(Float, nullable=False)
    soil_type = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    farmer = relationship("Farmer", back_populates="farms")
    crops = relationship("Crop", back_populates="farm")
    recommendations = relationship("Recommendation", back_populates="farm")

class Crop(Base):
    __tablename__ = "crops"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    planting_date = Column(DateTime, nullable=False)
    expected_harvest_date = Column(DateTime, nullable=True)
    current_stage = Column(String(50), nullable=False)  # seedling, vegetative, flowering, fruiting, harvesting
    area_planted = Column(Float, nullable=False)  # in acres
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    farm = relationship("Farm", back_populates="crops")
    recommendations = relationship("Recommendation", back_populates="crop")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    recommendation_type = Column(String(50), nullable=False)  # irrigation, fertilizer, pest_control
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False)  # low, medium, high, urgent
    status = Column(String(20), default="pending")  # pending, applied, dismissed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    farm = relationship("Farm", back_populates="recommendations")
    crop = relationship("Crop", back_populates="recommendations")

class WeatherData(Base):
    __tablename__ = "weather_data"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    farm = relationship("Farm")

class DiseaseDetection(Base):
    __tablename__ = "disease_detections"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    image_path = Column(String(500), nullable=False)
    predicted_disease = Column(String(100), nullable=False)
    confidence_score = Column(Float, nullable=False)
    detection_date = Column(DateTime(timezone=True), server_default=func.now())
    
    farm = relationship("Farm")
    crop = relationship("Crop")
