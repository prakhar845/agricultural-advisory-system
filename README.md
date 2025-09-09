# Agricultural Advisory System

A comprehensive web platform for farmers in the Kanpur region to get personalized agricultural recommendations based on real-time weather data, soil conditions, and crop images using machine learning models.

## Features

- **Farmer Registration & Authentication**: Secure user management system
- **Farm Management**: Add and manage multiple farm properties with location data
- **Crop Tracking**: Register and monitor crop plantings with growth stages
- **Weather Integration**: Real-time weather data from OpenWeatherMap API
- **Irrigation Recommendations**: AI-powered irrigation scheduling based on weather and soil conditions
- **Fertilizer Recommendations**: ML-based fertilizer suggestions using soil analysis
- **Disease Detection**: Computer vision model for plant disease identification from images
- **Personalized Dashboard**: Comprehensive overview of farms, crops, and recommendations

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **MySQL**: Relational database for data persistence
- **JWT Authentication**: Secure token-based authentication
- **OpenWeatherMap API**: Real-time weather data integration

### Frontend
- **React**: Modern JavaScript library for building user interfaces
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form handling and validation
- **Lucide React**: Beautiful icon library

### Machine Learning
- **Scikit-learn**: For fertilizer recommendation models
- **TensorFlow/Keras**: For plant disease detection
- **PIL/Pillow**: Image processing
- **NumPy & Pandas**: Data manipulation

## Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- OpenWeatherMap API key

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agricultural-advisory-system
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env_example.txt .env
# Edit .env with your database credentials and API keys

# Set up database
python setup_database.py

# Place your ML models in the models directory:
# - fertilizer_model.pkl
# - plant_disease_model.h5
# - disease_class_names.json

# Start the backend server
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. Database Setup

1. Install MySQL and create a database:
```sql
CREATE DATABASE agricultural_advisory;
```

2. Update the `.env` file with your database credentials:
```
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/agricultural_advisory
OPENWEATHER_API_KEY=your_openweather_api_key_here
SECRET_KEY=your_secret_key_here
```

## ML Models Integration

The system expects the following ML models in the `backend/models/` directory:

### 1. Fertilizer Model (`fertilizer_model.pkl`)
- **Purpose**: Predicts optimal fertilizer recommendations
- **Input**: Soil data (pH, organic matter, NPK levels, area)
- **Output**: Fertilizer type, amount, application method, timing

### 2. Plant Disease Model (`plant_disease_model.h5`)
- **Purpose**: Detects plant diseases from images
- **Input**: Crop images (224x224 pixels)
- **Output**: Disease classification with confidence scores

### 3. Disease Class Names (`disease_class_names.json`)
- **Purpose**: Maps model predictions to disease names
- **Format**: JSON object with class indices as keys and disease names as values

## API Endpoints

### Authentication
- `POST /auth/register` - Register new farmer
- `POST /auth/login` - Login farmer
- `GET /auth/me` - Get current farmer info

### Farms
- `GET /farms` - Get all farms for current farmer
- `POST /farms` - Create new farm
- `GET /farms/{farm_id}` - Get specific farm details
- `GET /farms/{farm_id}/weather` - Get current weather for farm
- `GET /farms/{farm_id}/weather/forecast` - Get weather forecast

### Crops
- `GET /farms/{farm_id}/crops` - Get crops for a farm
- `POST /crops` - Create new crop
- `GET /farms/{farm_id}/crops/{crop_id}/irrigation` - Get irrigation recommendations
- `GET /farms/{farm_id}/crops/{crop_id}/fertilizer` - Get fertilizer recommendations
- `POST /farms/{farm_id}/crops/{crop_id}/disease-detection` - Upload image for disease detection

### Recommendations
- `GET /farms/{farm_id}/recommendations` - Get all recommendations for a farm
- `GET /farms/{farm_id}/disease-history` - Get disease detection history

## Usage

1. **Register/Login**: Create an account or login to access the system
2. **Add Farm**: Register your farm with location and soil information
3. **Add Crops**: Record crop plantings with growth stages
4. **Get Recommendations**: View personalized irrigation and fertilizer recommendations
5. **Disease Detection**: Upload crop images to detect diseases and get treatment advice
6. **Monitor Weather**: Check current weather conditions and forecasts

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/agricultural_advisory
OPENWEATHER_API_KEY=your_openweather_api_key_here
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### OpenWeatherMap API

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your API key
3. Add it to your `.env` file

## Development

### Backend Development

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend
npm start
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:8000`.

## Production Deployment

### Backend Deployment

1. Set up a production database
2. Configure environment variables
3. Use a production ASGI server like Gunicorn with Uvicorn workers
4. Set up reverse proxy with Nginx

### Frontend Deployment

1. Build the production bundle:
```bash
npm run build
```
2. Serve the built files with a web server like Nginx

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing
Contributions are welcome! If you have suggestions for improvements, new analysis ideas, or bug fixes, please:

1. Fork the repository.
2. Create a new branch (git checkout -b feature/your-feature-name).
3. Make your changes and commit them (git commit -m 'Add new feature').
4. Push to the branch (git push origin feature/your-feature-name).
5. Open a Pull Request.
