from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from typing import List, Dict
import json
from pathlib import Path
import os
from data.data_processor import EmissionsDataProcessor
from pydantic import BaseModel

app = FastAPI(title="CO₂ Emissions Prediction API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data processor
data_processor = EmissionsDataProcessor()

class PredictionInput(BaseModel):
    gdp: float
    population: float
    energy_per_capita: float
    model_type: str = 'random_forest'

@app.on_event("startup")
async def startup_event():
    """Load data when the application starts"""
    try:
        # Try to load existing data
        data_path = Path("data/emissions_data.csv")
        if data_path.exists():
            data_processor.load_data(str(data_path))
        else:
            raise Exception("No data file found. Please upload data first.")
    except Exception as e:
        print(f"Error loading data: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Welcome to CO₂ Emissions Prediction API"}

@app.get("/available-years")
async def get_available_years():
    """Get list of available years in the dataset"""
    try:
        years = data_processor.get_available_years()
        return {"years": years}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/emissions/{year}")
async def get_emissions(year: int):
    """Get emissions data for all countries in a specific year"""
    try:
        return data_processor.get_emissions_by_year(year)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/emissions-range")
async def get_emissions_range():
    """Get the minimum and maximum emission values"""
    try:
        return data_processor.get_emissions_range()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/country/{country}")
async def get_country_data(country: str):
    """Get historical emissions data for a specific country"""
    try:
        return {"data": data_processor.get_country_timeline(country)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict_emissions(input_data: PredictionInput):
    """Predict CO2 emissions using the specified model"""
    try:
        prediction = data_processor.predict_emissions(
            data={
                'gdp': input_data.gdp,
                'population': input_data.population,
                'energy_per_capita': input_data.energy_per_capita
            },
            model_type=input_data.model_type
        )
        return {
            "prediction": prediction,
            "model_type": input_data.model_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-evaluation")
async def get_model_evaluation():
    """Get model evaluation metrics and feature importance"""
    try:
        return data_processor.get_model_evaluation()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/feature-importance/{model_type}")
async def get_feature_importance(model_type: str):
    """Get feature importance for the specified model"""
    try:
        return data_processor.get_feature_importance(model_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...)):
    """Upload and process new emissions data"""
    try:
        # Save uploaded file
        file_path = Path("data") / file.filename
        file_path.parent.mkdir(exist_ok=True)
        
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Load new data and train models
        data_processor.load_data(str(file_path))
        
        # Get model evaluation results
        evaluation = data_processor.get_model_evaluation()
        
        return {
            "message": "Data uploaded and models trained successfully",
            "years": data_processor.get_available_years(),
            "countries": data_processor.get_available_countries(),
            "model_evaluation": evaluation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 