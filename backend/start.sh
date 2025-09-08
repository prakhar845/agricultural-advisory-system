#!/bin/bash

# Agricultural Advisory System - Backend Startup Script

echo "🌱 Starting Agricultural Advisory System Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please copy env_example.txt to .env and configure it."
    echo "📝 Example: cp env_example.txt .env"
    exit 1
fi

# Check if models directory exists
if [ ! -d "models" ]; then
    echo "📁 Creating models directory..."
    mkdir models
    echo "⚠️  Please place your ML models in the models directory:"
    echo "   - fertilizer_model.pkl"
    echo "   - plant_disease_model.h5"
    echo "   - disease_class_names.json"
fi

# Set up database
echo "🗄️  Setting up database..."
python setup_database.py

# Start the server
echo "🚀 Starting FastAPI server..."
python run_server.py
