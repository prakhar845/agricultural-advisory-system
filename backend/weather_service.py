import requests
import os
from typing import Dict, Optional
from dotenv import load_dotenv
import logging

load_dotenv()

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        self.base_url = "http://api.openweathermap.org/data/2.5"
        
    def get_current_weather(self, latitude: float, longitude: float) -> Optional[Dict]:
        """
        Get current weather data for given coordinates
        """
        if not self.api_key:
            logging.warning("OpenWeatherMap API key not found")
            return self._get_mock_weather_data()
        
        try:
            url = f"{self.base_url}/weather"
            params = {
                "lat": latitude,
                "lon": longitude,
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "pressure": data["main"]["pressure"],
                "wind_speed": data["wind"]["speed"],
                "wind_direction": data["wind"].get("deg", 0),
                "rainfall": data.get("rain", {}).get("1h", 0),
                "description": data["weather"][0]["description"],
                "timestamp": data["dt"]
            }
            
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching weather data: {e}")
            return self._get_mock_weather_data()
        except KeyError as e:
            logging.error(f"Error parsing weather data: {e}")
            return self._get_mock_weather_data()
    
    def get_weather_forecast(self, latitude: float, longitude: float, days: int = 5) -> Optional[Dict]:
        """
        Get weather forecast for given coordinates
        """
        if not self.api_key:
            logging.warning("OpenWeatherMap API key not found")
            return self._get_mock_forecast_data()
        
        try:
            url = f"{self.base_url}/forecast"
            params = {
                "lat": latitude,
                "lon": longitude,
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Process forecast data
            forecast = []
            for item in data["list"][:days * 8]:  # 8 forecasts per day (3-hour intervals)
                forecast.append({
                    "datetime": item["dt_txt"],
                    "temperature": item["main"]["temp"],
                    "humidity": item["main"]["humidity"],
                    "rainfall": item.get("rain", {}).get("3h", 0),
                    "wind_speed": item["wind"]["speed"],
                    "description": item["weather"][0]["description"]
                })
            
            return {
                "forecast": forecast,
                "city": data["city"]["name"],
                "country": data["city"]["country"]
            }
            
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching forecast data: {e}")
            return self._get_mock_forecast_data()
        except KeyError as e:
            logging.error(f"Error parsing forecast data: {e}")
            return self._get_mock_forecast_data()
    
    def _get_mock_weather_data(self) -> Dict:
        """
        Return mock weather data when API is not available
        """
        import random
        from datetime import datetime
        
        return {
            "temperature": round(random.uniform(20, 35), 1),
            "humidity": round(random.uniform(40, 80), 1),
            "pressure": round(random.uniform(1000, 1020), 1),
            "wind_speed": round(random.uniform(2, 15), 1),
            "wind_direction": random.randint(0, 360),
            "rainfall": round(random.uniform(0, 5), 1),
            "description": "partly cloudy",
            "timestamp": int(datetime.now().timestamp()),
            "source": "mock_data"
        }
    
    def _get_mock_forecast_data(self) -> Dict:
        """
        Return mock forecast data when API is not available
        """
        import random
        from datetime import datetime, timedelta
        
        forecast = []
        base_time = datetime.now()
        
        for i in range(40):  # 5 days * 8 forecasts per day
            forecast_time = base_time + timedelta(hours=i * 3)
            forecast.append({
                "datetime": forecast_time.strftime("%Y-%m-%d %H:%M:%S"),
                "temperature": round(random.uniform(20, 35), 1),
                "humidity": round(random.uniform(40, 80), 1),
                "rainfall": round(random.uniform(0, 3), 1),
                "wind_speed": round(random.uniform(2, 15), 1),
                "description": random.choice(["clear sky", "few clouds", "scattered clouds", "broken clouds", "light rain"])
            })
        
        return {
            "forecast": forecast,
            "city": "Kanpur",
            "country": "IN",
            "source": "mock_data"
        }

# Global instance
weather_service = WeatherService()
