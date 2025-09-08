import pickle
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image
import json
import os
from typing import Dict, List, Tuple
import pandas as pd

class MLModelManager:
    def __init__(self):
        self.fertilizer_model = None
        self.disease_model = None
        self.disease_class_names = None
        self.load_models()
    
    def load_models(self):
        """Load all ML models and class names"""
        try:
            # Load fertilizer recommendation model
            if os.path.exists("models/fertilizer_model.pkl"):
                with open("models/fertilizer_model.pkl", "rb") as f:
                    self.fertilizer_model = pickle.load(f)
                print("Fertilizer model loaded successfully")
            
            # Load plant disease detection model
            if os.path.exists("models/plant_disease_model.h5"):
                self.disease_model = load_model("models/plant_disease_model.h5")
                print("Disease detection model loaded successfully")
            
            # Load disease class names
            if os.path.exists("models/disease_class_names.json"):
                with open("models/disease_class_names.json", "r") as f:
                    self.disease_class_names = json.load(f)
                print("Disease class names loaded successfully")
                
        except Exception as e:
            print(f"Error loading models: {e}")
    
    def predict_fertilizer_recommendation(self, soil_data: Dict) -> Dict:
        """
        Predict fertilizer recommendation based on soil data
        Expected input: {
            'soil_type': str,
            'crop_type': str,
            'soil_ph': float,
            'organic_matter': float,
            'nitrogen': float,
            'phosphorus': float,
            'potassium': float,
            'area_acres': float
        }
        """
        if self.fertilizer_model is None:
            return {
                "fertilizer_type": "NPK 20-20-20",
                "amount_per_acre": 50.0,
                "application_method": "Broadcast",
                "timing": "Before planting",
                "reason": "Default recommendation - model not available",
                "npk_analysis": {"nitrogen": 20, "phosphorus": 20, "potassium": 20},
                "application_tips": [
                    "Apply fertilizer evenly across the field",
                    "Avoid applying during heavy rainfall",
                    "Water the field after application"
                ]
            }
        
        try:
            # Check what type of model we have
            print(f"Fertilizer model type: {type(self.fertilizer_model)}")
            
            # Prepare input data for the model
            input_data = np.array([[
                soil_data.get('soil_ph', 6.5),
                soil_data.get('organic_matter', 2.0),
                soil_data.get('nitrogen', 50.0),
                soil_data.get('phosphorus', 30.0),
                soil_data.get('potassium', 100.0),
                soil_data.get('area_acres', 1.0)
            ]])
            
            # Make prediction based on model type
            if hasattr(self.fertilizer_model, 'predict'):
                # Standard sklearn model
                prediction = self.fertilizer_model.predict(input_data)
            elif hasattr(self.fertilizer_model, 'predict_proba'):
                # Model with probability prediction
                prediction = self.fertilizer_model.predict_proba(input_data)
                prediction = np.argmax(prediction, axis=1)
            elif isinstance(self.fertilizer_model, dict):
                # If it's a dictionary, use rule-based approach
                print("Model is a dictionary, using rule-based approach")
                return self._rule_based_fertilizer_recommendation(soil_data)
            else:
                # Fallback to rule-based approach
                print("Unknown model type, using rule-based approach")
                return self._rule_based_fertilizer_recommendation(soil_data)
            
            # Map prediction to fertilizer recommendation
            fertilizer_types = ["NPK 20-20-20", "Urea", "DAP", "MOP", "Organic Compost"]
            application_methods = ["Broadcast", "Side dressing", "Foliar spray", "Deep placement"]
            
            # Handle different prediction formats
            if hasattr(prediction, '__len__') and len(prediction) > 0:
                pred_value = prediction[0] if hasattr(prediction[0], '__len__') else prediction[0]
            else:
                pred_value = prediction
            
            fertilizer_type = fertilizer_types[int(pred_value) % len(fertilizer_types)]
            amount = max(20.0, min(100.0, float(pred_value) * 10))  # Scale to reasonable range
            
            # Extract NPK values from fertilizer type
            npk_values = self._extract_npk_from_fertilizer(fertilizer_type)
            
            return {
                "fertilizer_type": fertilizer_type,
                "amount_per_acre": float(amount),
                "application_method": application_methods[int(pred_value) % len(application_methods)],
                "timing": "Before planting and during growth stages",
                "reason": f"Based on soil analysis - pH: {soil_data.get('soil_ph', 6.5)}, Organic matter: {soil_data.get('organic_matter', 2.0)}%",
                "npk_analysis": npk_values,
                "application_tips": [
                    "Apply fertilizer evenly across the field",
                    "Avoid applying during heavy rainfall",
                    "Water the field after application",
                    "Store fertilizer in a dry, cool place"
                ]
            }
            
        except Exception as e:
            print(f"Error in fertilizer prediction: {e}")
            # Fallback to rule-based approach
            return self._rule_based_fertilizer_recommendation(soil_data)
    
    def _rule_based_fertilizer_recommendation(self, soil_data: Dict) -> Dict:
        """
        Rule-based fertilizer recommendation as fallback
        """
        soil_ph = soil_data.get('soil_ph', 6.5)
        organic_matter = soil_data.get('organic_matter', 2.0)
        nitrogen = soil_data.get('nitrogen', 50.0)
        phosphorus = soil_data.get('phosphorus', 30.0)
        potassium = soil_data.get('potassium', 100.0)
        
        # Determine fertilizer type based on soil conditions
        if soil_ph < 6.0:
            fertilizer_type = "Lime + NPK 15-15-15"
            amount = 60.0
        elif soil_ph > 8.0:
            fertilizer_type = "Sulfur + NPK 20-20-20"
            amount = 45.0
        elif organic_matter < 1.0:
            fertilizer_type = "Organic Compost + NPK 20-20-20"
            amount = 70.0
        elif nitrogen < 30:
            fertilizer_type = "Urea + NPK 20-20-20"
            amount = 55.0
        elif phosphorus < 20:
            fertilizer_type = "DAP + NPK 20-20-20"
            amount = 50.0
        elif potassium < 80:
            fertilizer_type = "MOP + NPK 20-20-20"
            amount = 50.0
        else:
            fertilizer_type = "NPK 20-20-20"
            amount = 50.0
        
        # Determine application method
        if amount > 60:
            application_method = "Broadcast"
        else:
            application_method = "Side dressing"
        
        # Extract NPK values from fertilizer type
        npk_values = self._extract_npk_from_fertilizer(fertilizer_type)
        
        return {
            "fertilizer_type": fertilizer_type,
            "amount_per_acre": amount,
            "application_method": application_method,
            "timing": "Before planting and during growth stages",
            "reason": f"Rule-based recommendation - pH: {soil_ph}, Organic matter: {organic_matter}%, N: {nitrogen}, P: {phosphorus}, K: {potassium}",
            "npk_analysis": npk_values,
            "application_tips": [
                "Apply fertilizer evenly across the field",
                "Avoid applying during heavy rainfall",
                "Water the field after application",
                "Store fertilizer in a dry, cool place"
            ]
        }
    
    def _extract_npk_from_fertilizer(self, fertilizer_type: str) -> Dict:
        """
        Extract NPK values from fertilizer type string
        """
        # Default NPK values
        npk_values = {
            "nitrogen": 20,
            "phosphorus": 20,
            "potassium": 20
        }
        
        # Try to extract NPK values from fertilizer type
        if "NPK" in fertilizer_type:
            # Look for pattern like "NPK 20-20-20"
            import re
            npk_match = re.search(r'NPK\s+(\d+)-(\d+)-(\d+)', fertilizer_type)
            if npk_match:
                npk_values["nitrogen"] = int(npk_match.group(1))
                npk_values["phosphorus"] = int(npk_match.group(2))
                npk_values["potassium"] = int(npk_match.group(3))
        elif "Urea" in fertilizer_type:
            npk_values = {"nitrogen": 46, "phosphorus": 0, "potassium": 0}
        elif "DAP" in fertilizer_type:
            npk_values = {"nitrogen": 18, "phosphorus": 46, "potassium": 0}
        elif "MOP" in fertilizer_type:
            npk_values = {"nitrogen": 0, "phosphorus": 0, "potassium": 60}
        elif "Organic" in fertilizer_type:
            npk_values = {"nitrogen": 2, "phosphorus": 1, "potassium": 1}
        
        return npk_values
    
    def predict_disease(self, image_path: str) -> Dict:
        """
        Predict plant disease from image
        """
        if self.disease_model is None or self.disease_class_names is None:
            return {
                "disease_name": "Unknown",
                "confidence": 0.0,
                "severity": "Unknown",
                "treatment_recommendations": ["Consult with agricultural expert"],
                "prevention_tips": ["Maintain proper plant hygiene", "Monitor regularly"]
            }
        
        try:
            # Load and preprocess image
            img = Image.open(image_path)
            img = img.resize((224, 224))  # Adjust size based on your model's requirements
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = img_array / 255.0  # Normalize
            
            # Make prediction
            predictions = self.disease_model.predict(img_array)
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx])
            
            # Get disease name
            disease_name = self.disease_class_names.get(str(predicted_class_idx), "Unknown Disease")
            
            # Determine severity based on confidence
            if confidence > 0.8:
                severity = "High"
            elif confidence > 0.6:
                severity = "Medium"
            else:
                severity = "Low"
            
            # Get treatment and prevention recommendations
            treatment_recommendations, prevention_tips = self._get_disease_recommendations(disease_name)
            
            return {
                "disease_name": disease_name,
                "confidence": confidence,
                "severity": severity,
                "treatment_recommendations": treatment_recommendations,
                "prevention_tips": prevention_tips
            }
            
        except Exception as e:
            print(f"Error in disease prediction: {e}")
            return {
                "disease_name": "Error in detection",
                "confidence": 0.0,
                "severity": "Unknown",
                "treatment_recommendations": ["Unable to process image", "Consult with agricultural expert"],
                "prevention_tips": ["Maintain proper plant hygiene", "Monitor regularly"]
            }
    
    def _get_disease_recommendations(self, disease_name: str) -> Tuple[List[str], List[str]]:
        """Get treatment and prevention recommendations for specific diseases"""
        recommendations = {
            "Healthy": (
                ["Continue current practices", "Maintain regular monitoring"],
                ["Keep plants well-watered", "Ensure proper spacing", "Regular inspection"]
            ),
            "Bacterial Blight": (
                ["Apply copper-based fungicide", "Remove infected plant parts", "Improve air circulation"],
                ["Avoid overhead watering", "Plant resistant varieties", "Crop rotation"]
            ),
            "Fungal Infection": (
                ["Apply fungicide treatment", "Remove infected leaves", "Improve drainage"],
                ["Avoid waterlogging", "Proper spacing", "Regular pruning"]
            ),
            "Viral Disease": (
                ["Remove infected plants", "Control insect vectors", "Use virus-free seeds"],
                ["Plant resistant varieties", "Control aphids and whiteflies", "Sanitize tools"]
            ),
            "Nutrient Deficiency": (
                ["Apply appropriate fertilizer", "Soil testing", "Foliar feeding"],
                ["Regular soil testing", "Balanced fertilization", "Organic matter addition"]
            )
        }
        
        # Try to find matching disease or return general recommendations
        for disease, (treatment, prevention) in recommendations.items():
            if disease.lower() in disease_name.lower() or disease_name.lower() in disease.lower():
                return treatment, prevention
        
        # Default recommendations
        return (
            ["Consult with agricultural expert", "Apply appropriate treatment"],
            ["Regular monitoring", "Maintain plant health", "Proper cultural practices"]
        )
    
    def predict_irrigation_schedule(self, weather_data: Dict, crop_data: Dict, soil_data: Dict) -> Dict:
        """
        Predict irrigation schedule based on weather, crop, and soil data
        """
        try:
            # Simple rule-based irrigation recommendation
            # In a real application, this would use a trained model
            
            temperature = weather_data.get('temperature', 25)
            humidity = weather_data.get('humidity', 60)
            rainfall = weather_data.get('rainfall', 0)
            crop_stage = crop_data.get('current_stage', 'vegetative')
            soil_type = soil_data.get('soil_type', 'loamy')
            
            # Calculate water requirement based on conditions
            base_water = 20  # liters per day per acre
            
            # Adjust for temperature
            if temperature > 30:
                water_multiplier = 1.5
            elif temperature > 25:
                water_multiplier = 1.2
            else:
                water_multiplier = 1.0
            
            # Adjust for humidity
            if humidity < 40:
                water_multiplier *= 1.3
            elif humidity > 80:
                water_multiplier *= 0.7
            
            # Adjust for crop stage
            stage_multipliers = {
                'seedling': 0.5,
                'vegetative': 1.0,
                'flowering': 1.3,
                'fruiting': 1.5,
                'harvesting': 0.8
            }
            water_multiplier *= stage_multipliers.get(crop_stage, 1.0)
            
            # Adjust for soil type
            soil_multipliers = {
                'sandy': 1.3,
                'loamy': 1.0,
                'clay': 0.8
            }
            water_multiplier *= soil_multipliers.get(soil_type, 1.0)
            
            # Reduce water if recent rainfall
            if rainfall > 10:  # mm
                water_multiplier *= 0.3
            elif rainfall > 5:
                water_multiplier *= 0.6
            
            recommended_water = base_water * water_multiplier
            
            # Determine frequency
            if recommended_water > 30:
                frequency = "daily"
            elif recommended_water > 15:
                frequency = "every_2_days"
            else:
                frequency = "weekly"
            
            # Best time for irrigation
            if temperature > 30:
                best_time = "early_morning"
            else:
                best_time = "evening"
            
            return {
                "recommended_water_amount": round(recommended_water, 2),
                "frequency": frequency,
                "best_time": best_time,
                "reason": f"Based on temperature: {temperature}°C, humidity: {humidity}%, rainfall: {rainfall}mm, crop stage: {crop_stage}"
            }
            
        except Exception as e:
            print(f"Error in irrigation prediction: {e}")
            return {
                "recommended_water_amount": 20.0,
                "frequency": "daily",
                "best_time": "early_morning",
                "reason": f"Default recommendation - error: {str(e)}"
            }

# Global instance
ml_manager = MLModelManager()
