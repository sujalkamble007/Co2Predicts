import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple
import joblib
from pathlib import Path
import os

class CO2Predictor:
    def __init__(self):
        self.model = XGBRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features for training/prediction"""
        # Create time-based features
        df['year_squared'] = df['year'] ** 2
        df['year_cubed'] = df['year'] ** 3
        
        # Create lag features
        df['emissions_lag1'] = df['co2_emissions'].shift(1)
        df['emissions_lag2'] = df['co2_emissions'].shift(2)
        
        # Drop rows with NaN values
        df = df.dropna()
        
        # Separate features and target
        X = df[['year', 'year_squared', 'year_cubed', 'emissions_lag1', 'emissions_lag2']]
        y = df['co2_emissions']
        
        return X, y
    
    def train(self, df: pd.DataFrame) -> Dict:
        """Train the model on historical data"""
        X, y = self.prepare_features(df)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True
        
        # Calculate training metrics
        y_pred = self.model.predict(X_scaled)
        mse = np.mean((y - y_pred) ** 2)
        rmse = np.sqrt(mse)
        
        return {
            "mse": float(mse),
            "rmse": float(rmse),
            "r2_score": float(self.model.score(X_scaled, y))
        }
    
    def predict(self, country_data: pd.DataFrame, years_ahead: int = 5) -> Dict:
        """Predict future CO2 emissions"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Prepare historical data
        X, _ = self.prepare_features(country_data)
        X_scaled = self.scaler.transform(X)
        
        # Get the last known data point
        last_year = country_data['year'].max()
        last_emission = country_data['co2_emissions'].iloc[-1]
        
        # Generate predictions
        predictions = []
        current_features = X.iloc[-1].copy()
        
        for year in range(1, years_ahead + 1):
            # Update features for next prediction
            current_features['year'] = last_year + year
            current_features['year_squared'] = current_features['year'] ** 2
            current_features['year_cubed'] = current_features['year'] ** 3
            current_features['emissions_lag1'] = last_emission
            current_features['emissions_lag2'] = country_data['co2_emissions'].iloc[-2]
            
            # Scale features and make prediction
            features_scaled = self.scaler.transform(current_features.values.reshape(1, -1))
            pred = self.model.predict(features_scaled)[0]
            
            predictions.append({
                "year": int(last_year + year),
                "predicted_emissions": float(pred)
            })
            
            # Update for next iteration
            last_emission = pred
        
        return {
            "country": country_data['country'].iloc[0],
            "predictions": predictions
        }
    
    def save_model(self, path: str):
        """Save the trained model and scaler"""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        model_path = Path(path)
        model_path.parent.mkdir(parents=True, exist_ok=True)
        
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler
        }, model_path)
    
    def load_model(self, path: str):
        """Load a trained model and scaler"""
        saved_data = joblib.load(path)
        self.model = saved_data['model']
        self.scaler = saved_data['scaler']
        self.is_trained = True 