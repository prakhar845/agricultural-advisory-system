from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Farmer schemas
class FarmerBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    location: str

class FarmerCreate(FarmerBase):
    password: str

class FarmerLogin(BaseModel):
    email: EmailStr
    password: str

class Farmer(FarmerBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Farm schemas
class FarmBase(BaseModel):
    name: str
    size_acres: float
    soil_type: str
    latitude: float
    longitude: float

class FarmCreate(FarmBase):
    pass

class Farm(FarmBase):
    id: int
    farmer_id: int
    created_at: datetime
    crops: List['Crop'] = []
    
    class Config:
        from_attributes = True

# Crop schemas
class CropBase(BaseModel):
    crop_name: str
    planting_date: datetime
    expected_harvest_date: Optional[datetime] = None
    current_stage: str
    area_planted: float

class CropCreate(CropBase):
    farm_id: int

class Crop(CropBase):
    id: int
    farm_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Recommendation schemas
class RecommendationBase(BaseModel):
    recommendation_type: str
    title: str
    description: str
    priority: str

class RecommendationCreate(RecommendationBase):
    farm_id: int
    crop_id: int

class Recommendation(RecommendationBase):
    id: int
    farm_id: int
    crop_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Weather data schemas
class WeatherDataBase(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float

class WeatherDataCreate(WeatherDataBase):
    farm_id: int

class WeatherData(WeatherDataBase):
    id: int
    farm_id: int
    recorded_at: datetime
    
    class Config:
        from_attributes = True

# Disease detection schemas
class DiseaseDetectionBase(BaseModel):
    predicted_disease: str
    confidence_score: float

class DiseaseDetectionCreate(DiseaseDetectionBase):
    farm_id: int
    crop_id: int
    image_path: str

class DiseaseDetection(DiseaseDetectionBase):
    id: int
    farm_id: int
    crop_id: int
    image_path: str
    detection_date: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Response schemas
class IrrigationRecommendation(BaseModel):
    recommended_water_amount: float  # in liters
    frequency: str  # daily, every_2_days, weekly
    best_time: str  # morning, evening
    reason: str

class FertilizerRecommendation(BaseModel):
    fertilizer_type: str
    amount_per_acre: float  # in kg
    application_method: str
    timing: str
    reason: str

class PestDetectionResult(BaseModel):
    disease_name: str
    confidence: float
    severity: str  # low, medium, high
    treatment_recommendations: List[str]
    prevention_tips: List[str]
