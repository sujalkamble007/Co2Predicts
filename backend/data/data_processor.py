import pandas as pd
import numpy as np
import json
from pathlib import Path
from typing import Dict, List, Optional
from ml.model_trainer import EmissionsModelTrainer

class EmissionsDataProcessor:
    def __init__(self):
        self.data = None
        self.years = []
        self.countries = []
        self.model_trainer = EmissionsModelTrainer()
        
    def load_data(self, file_path: str) -> None:
        """Load emissions data from CSV file"""
        try:
            self.data = pd.read_csv(file_path)
            
            # Drop aggregate entries
            self.data = self.data[~self.data['country'].isin([
                'World', 'Asia', 'Europe', 'Africa', 
                'North America', 'South America', 'Oceania'
            ])]
            
            # Keep relevant columns
            required_columns = ['year', 'country', 'gdp', 'population', 'energy_per_capita', 'co2']
            if not all(col in self.data.columns for col in required_columns):
                raise ValueError(f"Data must contain these columns: {required_columns}")
            
            self.data = self.data[required_columns]
            
            # Update years and countries
            self.years = sorted(self.data['year'].unique().tolist())
            self.countries = sorted(self.data['country'].unique().tolist())
            
            # Train models
            self.train_models()
            
        except Exception as e:
            raise Exception(f"Error loading data: {str(e)}")
    
    def train_models(self) -> Dict:
        """Train and evaluate models"""
        if self.data is None:
            raise Exception("No data loaded")
        
        return self.model_trainer.train_and_evaluate(self.data)
    
    def get_emissions_by_year(self, year: int) -> Dict:
        """Get emissions data for all countries in a specific year"""
        if self.data is None:
            raise Exception("No data loaded")
            
        year_data = self.data[self.data['year'] == year]
        return {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {
                        'name': row['country'],
                        'emissions': row['co2'],
                        'gdp': row['gdp'],
                        'population': row['population'],
                        'energy_per_capita': row['energy_per_capita'],
                        'year': year
                    },
                    'id': row['country']
                }
                for _, row in year_data.iterrows()
            ]
        }
    
    def get_country_timeline(self, country: str) -> List[Dict]:
        """Get historical emissions data for a specific country"""
        if self.data is None:
            raise Exception("No data loaded")
            
        country_data = self.data[self.data['country'] == country]
        return country_data.to_dict('records')
    
    def predict_emissions(self, data: Dict[str, float], model_type: str = 'random_forest') -> float:
        """Predict CO2 emissions using the specified model"""
        return self.model_trainer.predict_emissions(data, model_type)
    
    def get_model_evaluation(self) -> Dict:
        """Get model evaluation metrics and feature importance"""
        if self.data is None:
            raise Exception("No data loaded")
            
        return self.model_trainer.train_and_evaluate(self.data)
    
    def get_feature_importance(self, model_type: str = 'random_forest') -> Dict[str, float]:
        """Get feature importance for the specified model"""
        return self.model_trainer.get_feature_importance(model_type)
    
    def get_available_years(self) -> List[int]:
        """Get list of available years in the dataset"""
        return self.years
    
    def get_available_countries(self) -> List[str]:
        """Get list of available countries in the dataset"""
        return self.countries
    
    def get_emissions_range(self) -> Dict[str, float]:
        """Get the min and max emission values in the dataset"""
        if self.data is None:
            raise Exception("No data loaded")
            
        return {
            'min': float(self.data['co2'].min()),
            'max': float(self.data['co2'].max())
        }
    
    def download_world_bank_data(self) -> None:
        """Download CO2 emissions data from World Bank API"""
        try:
            # World Bank API endpoint for CO2 emissions per capita
            url = "http://api.worldbank.org/v2/country/all/indicator/EN.ATM.CO2E.PC"
            params = {
                'format': 'json',
                'per_page': 1000,
                'date': '2000:2021'  # Last 20 years of data
            }
            
            # Download and process the data
            # This is a placeholder - actual implementation would need to handle pagination
            # and proper API response processing
            pass
            
        except Exception as e:
            raise Exception(f"Error downloading World Bank data: {str(e)}")
    
    def save_processed_data(self, output_path: str) -> None:
        """Save processed data to CSV file"""
        if self.data is None:
            raise Exception("No data to save")
            
        self.data.to_csv(output_path, index=False)
        
        # Save trained models
        model_path = Path(output_path).parent / 'models.joblib'
        self.model_trainer.save_models(str(model_path))

# Example usage:
if __name__ == "__main__":
    processor = EmissionsDataProcessor()
    # Load and process data
    processor.load_data('emissions_data.csv')
    # Train and evaluate models
    evaluation = processor.get_model_evaluation()
    print("Model Evaluation:", evaluation) 