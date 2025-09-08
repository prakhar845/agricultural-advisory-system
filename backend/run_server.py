#!/usr/bin/env python3
"""
Development server runner for Agricultural Advisory System
"""

import uvicorn
import os
from dotenv import load_dotenv

def main():
    """Run the development server"""
    load_dotenv()
    
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print("🌱 Starting Agricultural Advisory System...")
    print(f"📍 Server will be available at: http://{host}:{port}")
    print("📚 API documentation: http://localhost:8000/docs")
    print("🔧 Interactive API: http://localhost:8000/redoc")
    print("\nPress Ctrl+C to stop the server")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )

if __name__ == "__main__":
    main()
