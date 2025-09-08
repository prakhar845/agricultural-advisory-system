from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime, timedelta

from database import get_db, engine
from models import Base, Farmer, Farm, Crop, Recommendation, WeatherData, DiseaseDetection
from schemas import (
    FarmerCreate, FarmerLogin, Farmer as FarmerSchema, Token,
    FarmCreate, Farm as FarmSchema,
    CropCreate, Crop as CropSchema,
    Recommendation as RecommendationSchema,
    IrrigationRecommendation, FertilizerRecommendation, PestDetectionResult
)
from auth import (
    authenticate_farmer, create_access_token, get_current_farmer,
    get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
)
from ml_models import ml_manager
from weather_service import weather_service

# Create database tables
Base.metadata.create_all(bind=engine)

async def generate_automatic_recommendations(farm_id: int, db: Session):
    """Generate automatic recommendations based on farm conditions"""
    # Check if recommendations already exist for today
    today = datetime.now().date()
    existing_recommendations = db.query(Recommendation).filter(
        Recommendation.farm_id == farm_id,
        Recommendation.created_at >= today
    ).count()
    
    if existing_recommendations > 0:
        return  # Already generated recommendations for today
    
    # Get farm and its crops
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        return
    
    crops = db.query(Crop).filter(Crop.farm_id == farm_id).all()
    if not crops:
        return
    
    # Get current weather data
    try:
        weather_data = weather_service.get_current_weather(farm.latitude, farm.longitude)
        
        # Generate weather-based recommendations
        if weather_data.get('temperature', 0) > 35:
            recommendation = Recommendation(
                farm_id=farm_id,
                crop_id=crops[0].id,  # Use first crop as reference
                recommendation_type="irrigation",
                title="High Temperature Alert",
                description=f"Temperature is {weather_data.get('temperature', 0):.1f}°C. Consider increasing irrigation frequency to prevent heat stress.",
                priority="high",
                status="pending"
            )
            db.add(recommendation)
        
        if weather_data.get('humidity', 0) < 30:
            recommendation = Recommendation(
                farm_id=farm_id,
                crop_id=crops[0].id,
                recommendation_type="irrigation",
                title="Low Humidity Alert",
                description=f"Humidity is {weather_data.get('humidity', 0):.1f}%. Consider misting or increasing irrigation to maintain soil moisture.",
                priority="medium",
                status="pending"
            )
            db.add(recommendation)
        
        if weather_data.get('wind_speed', 0) > 15:
            recommendation = Recommendation(
                farm_id=farm_id,
                crop_id=crops[0].id,
                recommendation_type="general",
                title="High Wind Warning",
                description=f"Wind speed is {weather_data.get('wind_speed', 0):.1f} km/h. Consider protecting young plants and checking irrigation systems.",
                priority="medium",
                status="pending"
            )
            db.add(recommendation)
            
    except Exception as e:
        print(f"Error getting weather data for recommendations: {e}")
    
    # Generate crop-based recommendations
    for crop in crops:
        # Check crop stage and generate appropriate recommendations
        if crop.current_stage == "seedling":
            recommendation = Recommendation(
                farm_id=farm_id,
                crop_id=crop.id,
                recommendation_type="fertilizer",
                title="Seedling Stage Care",
                description=f"Your {crop.crop_name} is in seedling stage. Apply light fertilizer and ensure consistent moisture.",
                priority="medium",
                status="pending"
            )
            db.add(recommendation)
        
        elif crop.current_stage == "flowering":
            recommendation = Recommendation(
                farm_id=farm_id,
                crop_id=crop.id,
                recommendation_type="fertilizer",
                title="Flowering Stage Nutrition",
                description=f"Your {crop.crop_name} is flowering. Apply phosphorus-rich fertilizer to support flower development.",
                priority="high",
                status="pending"
            )
            db.add(recommendation)
        
        elif crop.current_stage == "fruiting":
            recommendation = Recommendation(
                farm_id=farm_id,
                crop_id=crop.id,
                recommendation_type="irrigation",
                title="Fruiting Stage Watering",
                description=f"Your {crop.crop_name} is fruiting. Maintain consistent soil moisture for optimal fruit development.",
                priority="high",
                status="pending"
            )
            db.add(recommendation)
    
    # Generate soil-based recommendations
    if farm.soil_type == "sandy":
        recommendation = Recommendation(
            farm_id=farm_id,
            crop_id=crops[0].id,
            recommendation_type="fertilizer",
            title="Sandy Soil Management",
            description="Sandy soil drains quickly. Consider adding organic matter and applying fertilizer in smaller, more frequent doses.",
            priority="medium",
            status="pending"
        )
        db.add(recommendation)
    
    elif farm.soil_type == "clay":
        recommendation = Recommendation(
            farm_id=farm_id,
            crop_id=crops[0].id,
            recommendation_type="irrigation",
            title="Clay Soil Management",
            description="Clay soil retains water well. Be careful not to overwater and ensure good drainage.",
            priority="medium",
            status="pending"
        )
        db.add(recommendation)
    
    # Commit all recommendations
    try:
        db.commit()
        print(f"Generated automatic recommendations for farm {farm_id}")
    except Exception as e:
        db.rollback()
        print(f"Error saving recommendations: {e}")

app = FastAPI(
    title="Agricultural Advisory System",
    description="A comprehensive platform for farmers to get personalized agricultural recommendations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
os.makedirs("uploads", exist_ok=True)

@app.post("/auth/register", response_model=FarmerSchema)
async def register_farmer(farmer: FarmerCreate, db: Session = Depends(get_db)):
    """Register a new farmer"""
    # Check if farmer already exists
    existing_farmer = db.query(Farmer).filter(Farmer.email == farmer.email).first()
    if existing_farmer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new farmer
    hashed_password = get_password_hash(farmer.password)
    db_farmer = Farmer(
        name=farmer.name,
        email=farmer.email,
        phone=farmer.phone,
        location=farmer.location,
        hashed_password=hashed_password
    )
    
    db.add(db_farmer)
    db.commit()
    db.refresh(db_farmer)
    
    return db_farmer

@app.post("/auth/login", response_model=Token)
async def login_farmer(farmer_login: FarmerLogin, db: Session = Depends(get_db)):
    """Login farmer and return access token"""
    farmer = authenticate_farmer(db, farmer_login.email, farmer_login.password)
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": farmer.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=FarmerSchema)
async def get_current_farmer_info(current_farmer: Farmer = Depends(get_current_farmer)):
    """Get current farmer information"""
    return current_farmer

# Farm endpoints
@app.post("/farms", response_model=FarmSchema)
async def create_farm(
    farm: FarmCreate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Create a new farm"""
    db_farm = Farm(
        farmer_id=current_farmer.id,
        name=farm.name,
        size_acres=farm.size_acres,
        soil_type=farm.soil_type,
        latitude=farm.latitude,
        longitude=farm.longitude
    )
    
    db.add(db_farm)
    db.commit()
    db.refresh(db_farm)
    
    return db_farm

@app.get("/farms", response_model=List[FarmSchema])
async def get_farms(
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get all farms for current farmer"""
    farms = db.query(Farm).filter(Farm.farmer_id == current_farmer.id).all()
    
    # Load crops for each farm
    for farm in farms:
        farm.crops = db.query(Crop).filter(Crop.farm_id == farm.id).all()
    
    return farms

@app.get("/farms/{farm_id}", response_model=FarmSchema)
async def get_farm(
    farm_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get specific farm details"""
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    return farm

@app.put("/farms/{farm_id}", response_model=FarmSchema)
async def update_farm(
    farm_id: int,
    farm_update: FarmCreate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Update a farm"""
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    # Update farm fields
    farm.name = farm_update.name
    farm.size_acres = farm_update.size_acres
    farm.soil_type = farm_update.soil_type
    farm.latitude = farm_update.latitude
    farm.longitude = farm_update.longitude
    
    db.commit()
    db.refresh(farm)
    
    return farm

# Crop endpoints
@app.post("/crops", response_model=CropSchema)
async def create_crop(
    crop: CropCreate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Create a new crop"""
    # Verify farm belongs to farmer
    farm = db.query(Farm).filter(
        Farm.id == crop.farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    db_crop = Crop(
        farm_id=crop.farm_id,
        crop_name=crop.crop_name,
        planting_date=crop.planting_date,
        expected_harvest_date=crop.expected_harvest_date,
        current_stage=crop.current_stage,
        area_planted=crop.area_planted
    )
    
    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)
    
    return db_crop

@app.get("/farms/{farm_id}/crops", response_model=List[CropSchema])
async def get_farm_crops(
    farm_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get all crops for a specific farm"""
    # Verify farm belongs to farmer
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    crops = db.query(Crop).filter(Crop.farm_id == farm_id).all()
    return crops

# Weather endpoints
@app.get("/farms/{farm_id}/weather")
async def get_farm_weather(
    farm_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get current weather data for a farm"""
    # Verify farm belongs to farmer
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    # Get weather data
    weather_data = weather_service.get_current_weather(farm.latitude, farm.longitude)
    
    # Store weather data in database
    if weather_data:
        db_weather = WeatherData(
            farm_id=farm_id,
            temperature=weather_data["temperature"],
            humidity=weather_data["humidity"],
            rainfall=weather_data["rainfall"],
            wind_speed=weather_data["wind_speed"]
        )
        db.add(db_weather)
        db.commit()
    
    return weather_data

@app.get("/farms/{farm_id}/weather/forecast")
async def get_farm_weather_forecast(
    farm_id: int,
    days: int = 5,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get weather forecast for a farm"""
    # Verify farm belongs to farmer
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    forecast_data = weather_service.get_weather_forecast(farm.latitude, farm.longitude, days)
    return forecast_data

# Recommendation endpoints
@app.get("/farms/{farm_id}/crops/{crop_id}/irrigation", response_model=IrrigationRecommendation)
async def get_irrigation_recommendation(
    farm_id: int,
    crop_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get irrigation recommendation for a crop"""
    # Verify farm and crop belong to farmer
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.farm_id == farm_id
    ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    
    # Get current weather data
    weather_data = weather_service.get_current_weather(farm.latitude, farm.longitude)
    
    # Prepare data for ML model
    crop_data = {
        "current_stage": crop.current_stage,
        "crop_name": crop.crop_name
    }
    
    soil_data = {
        "soil_type": farm.soil_type
    }
    
    # Get irrigation recommendation
    recommendation = ml_manager.predict_irrigation_schedule(weather_data, crop_data, soil_data)
    
    return IrrigationRecommendation(**recommendation)

@app.get("/farms/{farm_id}/crops/{crop_id}/fertilizer", response_model=FertilizerRecommendation)
async def get_fertilizer_recommendation(
    farm_id: int,
    crop_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get fertilizer recommendation for a crop"""
    # Verify farm and crop belong to farmer
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.farm_id == farm_id
    ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    
    # Prepare soil data for ML model
    soil_data = {
        "soil_type": farm.soil_type,
        "crop_type": crop.crop_name,
        "area_acres": crop.area_planted
    }
    
    # Get fertilizer recommendation
    recommendation = ml_manager.predict_fertilizer_recommendation(soil_data)
    
    return FertilizerRecommendation(**recommendation)

@app.post("/farms/{farm_id}/crops/{crop_id}/disease-detection", response_model=PestDetectionResult)
async def detect_disease(
    farm_id: int,
    crop_id: int,
    image: UploadFile = File(...),
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Upload image for disease detection"""
    # Verify farm and crop belong to farmer
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    crop = db.query(Crop).filter(
        Crop.id == crop_id,
        Crop.farm_id == farm_id
    ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    
    # Save uploaded image
    file_extension = image.filename.split(".")[-1] if "." in image.filename else "jpg"
    filename = f"disease_{farm_id}_{crop_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
    file_path = os.path.join("uploads", filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    # Predict disease
    prediction = ml_manager.predict_disease(file_path)
    
    # Store detection result in database
    db_detection = DiseaseDetection(
        farm_id=farm_id,
        crop_id=crop_id,
        image_path=file_path,
        predicted_disease=prediction["disease_name"],
        confidence_score=prediction["confidence"]
    )
    db.add(db_detection)
    db.commit()
    
    return PestDetectionResult(**prediction)

@app.get("/farms/{farm_id}/recommendations", response_model=List[RecommendationSchema])
async def get_farm_recommendations(
    farm_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get all recommendations for a farm"""
    # Verify farm belongs to farmer
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    # Generate automatic recommendations if none exist
    await generate_automatic_recommendations(farm_id, db)
    
    recommendations = db.query(Recommendation).filter(Recommendation.farm_id == farm_id).all()
    return recommendations


@app.get("/farms/{farm_id}/disease-history")
async def get_disease_history(
    farm_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get disease detection history for a farm"""
    # Verify farm belongs to farmer
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.farmer_id == current_farmer.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found"
        )
    
    detections = db.query(DiseaseDetection).filter(DiseaseDetection.farm_id == farm_id).all()
    return detections

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Agricultural Advisory System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
