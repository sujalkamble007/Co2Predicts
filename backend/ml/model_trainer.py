import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import joblib
from pathlib import Path
from typing import Dict, Tuple, List

class EmissionsModelTrainer:
    def __init__(self):
        self.linear_model = LinearRegression()
        self.rf_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.features = ['gdp', 'population', 'energy_per_capita']
        self.target = 'co2'
        
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features and target for training"""
        # Drop aggregate entries
        df = df[~df['country'].isin([
            'World', 'Asia', 'Europe', 'Africa', 
            'North America', 'South America', 'Oceania'
        ])]
        
        # Drop rows with missing values
        df = df.dropna(subset=self.features + [self.target])
        
        # Scale features
        X = self.scaler.fit_transform(df[self.features])
        y = df[self.target].values
        
        return X, y
    
    def train_and_evaluate(self, df: pd.DataFrame) -> Dict:
        """Train both models and evaluate their performance"""
        X, y = self.prepare_data(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train Linear Regression
        self.linear_model.fit(X_train, y_train)
        linear_pred = self.linear_model.predict(X_test)
        linear_cv_scores = cross_val_score(
            self.linear_model, X, y, cv=5, scoring='r2'
        )
        
        # Train Random Forest
        self.rf_model.fit(X_train, y_train)
        rf_pred = self.rf_model.predict(X_test)
        rf_cv_scores = cross_val_score(
            self.rf_model, X, y, cv=5, scoring='r2'
        )
        
        # Calculate metrics
        results = {
            'linear_regression': {
                'r2_score': r2_score(y_test, linear_pred),
                'rmse': np.sqrt(mean_squared_error(y_test, linear_pred)),
                'cv_scores_mean': linear_cv_scores.mean(),
                'cv_scores_std': linear_cv_scores.std(),
                'feature_importance': dict(zip(
                    self.features,
                    self.linear_model.coef_
                ))
            },
            'random_forest': {
                'r2_score': r2_score(y_test, rf_pred),
                'rmse': np.sqrt(mean_squared_error(y_test, rf_pred)),
                'cv_scores_mean': rf_cv_scores.mean(),
                'cv_scores_std': rf_cv_scores.std(),
                'feature_importance': dict(zip(
                    self.features,
                    self.rf_model.feature_importances_
                ))
            }
        }
        
        return results
    
    def predict_emissions(self, data: Dict[str, float], model_type: str = 'random_forest') -> float:
        """Predict CO2 emissions using the specified model"""
        # Prepare input data
        input_data = np.array([[
            data['gdp'],
            data['population'],
            data['energy_per_capita']
        ]])
        
        # Scale input
        input_scaled = self.scaler.transform(input_data)
        
        # Make prediction
        if model_type == 'linear':
            prediction = self.linear_model.predict(input_scaled)[0]
        else:
            prediction = self.rf_model.predict(input_scaled)[0]
            
        return float(prediction)
    
    def get_feature_importance(self, model_type: str = 'random_forest') -> Dict[str, float]:
        """Get feature importance for the specified model"""
        if model_type == 'linear':
            importance = dict(zip(
                self.features,
                self.linear_model.coef_
            ))
        else:
            importance = dict(zip(
                self.features,
                self.rf_model.feature_importances_
            ))
            
        return importance
    
    def save_models(self, path: str):
        """Save trained models and scaler"""
        model_path = Path(path)
        model_path.parent.mkdir(parents=True, exist_ok=True)
        
        joblib.dump({
            'linear_model': self.linear_model,
            'rf_model': self.rf_model,
            'scaler': self.scaler,
            'features': self.features
        }, model_path)
    
    def load_models(self, path: str):
        """Load trained models and scaler"""
        saved_data = joblib.load(path)
        self.linear_model = saved_data['linear_model']
        self.rf_model = saved_data['rf_model']
        self.scaler = saved_data['scaler']
        self.features = saved_data['features'] 