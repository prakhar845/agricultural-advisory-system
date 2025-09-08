#!/usr/bin/env python3
"""
Database setup script for Agricultural Advisory System
Run this script to create the database and tables
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Base, engine
from models import Farmer, Farm, Crop, Recommendation, WeatherData, DiseaseDetection

def create_database():
    """Create the database if it doesn't exist"""
    load_dotenv()
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost:3306/agricultural_advisory")
    
    # Extract database name from URL
    db_name = database_url.split("/")[-1]
    
    # Create connection without specifying database
    base_url = "/".join(database_url.split("/")[:-1])
    temp_engine = create_engine(base_url)
    
    try:
        with temp_engine.connect() as conn:
            # Create database if it doesn't exist
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
            print(f"Database '{db_name}' created successfully or already exists")
    except Exception as e:
        print(f"Error creating database: {e}")
        return False
    
    return True

def create_tables():
    """Create all tables"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("All tables created successfully")
        return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False

def main():
    """Main setup function"""
    print("Setting up Agricultural Advisory System Database...")
    
    # Create database
    if not create_database():
        print("Failed to create database")
        return
    
    # Create tables
    if not create_tables():
        print("Failed to create tables")
        return
    
    print("Database setup completed successfully!")
    print("\nNext steps:")
    print("1. Make sure your .env file is configured with correct database credentials")
    print("2. Place your ML models in the 'models' directory:")
    print("   - fertilizer_model.pkl")
    print("   - plant_disease_model.h5")
    print("   - disease_class_names.json")
    print("3. Run the FastAPI server: uvicorn main:app --reload")

if __name__ == "__main__":
    main()
