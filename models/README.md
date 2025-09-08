# ML Models Directory

This directory should contain the machine learning models required for the Agricultural Advisory System.

## Required Models

### 1. Fertilizer Recommendation Model
- **File**: `fertilizer_model.pkl`
- **Type**: Scikit-learn model (pickle format)
- **Purpose**: Predicts optimal fertilizer recommendations based on soil data
- **Expected Input Features**:
  - Soil pH (float)
  - Organic matter percentage (float)
  - Nitrogen level (float)
  - Phosphorus level (float)
  - Potassium level (float)
  - Area in acres (float)
- **Expected Output**: Fertilizer recommendation (type, amount, method, timing)

### 2. Plant Disease Detection Model
- **File**: `plant_disease_model.h5`
- **Type**: TensorFlow/Keras model (HDF5 format)
- **Purpose**: Detects plant diseases from crop images
- **Expected Input**: Images resized to 224x224 pixels, normalized (0-1)
- **Expected Output**: Disease classification probabilities

### 3. Disease Class Names
- **File**: `disease_class_names.json`
- **Type**: JSON file
- **Purpose**: Maps model prediction indices to disease names
- **Format**:
```json
{
  "0": "Healthy",
  "1": "Bacterial Blight",
  "2": "Fungal Infection",
  "3": "Viral Disease",
  "4": "Nutrient Deficiency"
}
```

## Model Integration

The models are automatically loaded by the `MLModelManager` class in `backend/ml_models.py`. The system will:

1. Check for model files on startup
2. Load models into memory
3. Provide fallback recommendations if models are not available
4. Handle errors gracefully with default responses

## Model Training Notes

If you need to retrain or update the models:

1. **Fertilizer Model**: Train using soil data and fertilizer application records
2. **Disease Model**: Train using labeled crop images with various diseases
3. **Class Names**: Update the JSON file to match your model's output classes

## Testing Models

You can test the models by:

1. Starting the backend server
2. Using the API endpoints for recommendations
3. Uploading test images for disease detection
4. Checking the console logs for model loading status

## Troubleshooting

- **Model not loading**: Check file paths and formats
- **Prediction errors**: Verify input data format matches model expectations
- **Low accuracy**: Consider retraining with more data or different algorithms

## Security Note

Never commit actual model files to version control if they contain sensitive training data. Use `.gitignore` to exclude model files or use a separate model repository.
