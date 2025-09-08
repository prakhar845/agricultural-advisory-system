#!/bin/bash

# Agricultural Advisory System - Frontend Startup Script

echo "🌱 Starting Agricultural Advisory System Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    echo "REACT_APP_API_URL=http://localhost:8000" > .env
fi

# Start the development server
echo "🚀 Starting React development server..."
npm start
