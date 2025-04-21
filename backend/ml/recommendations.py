from typing import Dict, List
import numpy as np

class EmissionRecommendations:
    def __init__(self):
        self.recommendations = {
            'high_emissions': [
                "Implement carbon pricing mechanisms",
                "Invest in renewable energy infrastructure",
                "Promote electric vehicle adoption",
                "Improve energy efficiency in industries",
                "Develop sustainable public transportation"
            ],
            'medium_emissions': [
                "Expand renewable energy capacity",
                "Enhance building energy efficiency",
                "Support sustainable agriculture",
                "Promote waste reduction and recycling",
                "Develop green urban planning"
            ],
            'low_emissions': [
                "Maintain and expand existing green initiatives",
                "Invest in carbon capture technologies",
                "Promote sustainable tourism",
                "Support local environmental projects",
                "Educate about sustainable living"
            ]
        }
        
        self.industry_specific = {
            'manufacturing': [
                "Adopt energy-efficient manufacturing processes",
                "Implement waste heat recovery systems",
                "Switch to renewable energy sources",
                "Optimize supply chain logistics",
                "Invest in carbon capture technology"
            ],
            'transportation': [
                "Expand public transportation networks",
                "Promote electric vehicle infrastructure",
                "Implement congestion pricing",
                "Develop bike-friendly cities",
                "Optimize freight transportation"
            ],
            'energy': [
                "Transition to renewable energy sources",
                "Modernize power grid infrastructure",
                "Implement smart grid technologies",
                "Promote energy storage solutions",
                "Develop microgrid systems"
            ],
            'agriculture': [
                "Implement precision farming techniques",
                "Reduce fertilizer use",
                "Promote sustainable livestock management",
                "Develop agroforestry systems",
                "Support organic farming"
            ]
        }
    
    def get_recommendations(self, 
                          current_emissions: float,
                          historical_trend: List[float],
                          industry_breakdown: Dict[str, float]) -> Dict:
        """
        Generate recommendations based on emission levels and trends
        
        Args:
            current_emissions: Current CO2 emissions in metric tons
            historical_trend: List of historical emissions values
            industry_breakdown: Dictionary of industry sectors and their emission contributions
        
        Returns:
            Dictionary containing recommendations and analysis
        """
        # Calculate emission trend
        trend = np.polyfit(range(len(historical_trend)), historical_trend, 1)[0]
        
        # Determine emission level category
        if current_emissions > 10:  # metric tons per capita
            emission_level = 'high_emissions'
        elif current_emissions > 5:
            emission_level = 'medium_emissions'
        else:
            emission_level = 'low_emissions'
        
        # Get base recommendations
        base_recommendations = self.recommendations[emission_level]
        
        # Get industry-specific recommendations
        industry_recs = []
        for industry, contribution in industry_breakdown.items():
            if contribution > 0.2:  # If industry contributes more than 20%
                industry_recs.extend(self.industry_specific.get(industry, []))
        
        # Combine and deduplicate recommendations
        all_recommendations = list(set(base_recommendations + industry_recs))
        
        # Calculate priority scores
        priority_scores = []
        for rec in all_recommendations:
            score = 0
            # Higher priority for high emission levels
            if emission_level == 'high_emissions':
                score += 2
            elif emission_level == 'medium_emissions':
                score += 1
            
            # Higher priority for increasing trends
            if trend > 0:
                score += 2
            
            # Higher priority for industry-specific recommendations
            if rec in industry_recs:
                score += 1
            
            priority_scores.append(score)
        
        # Sort recommendations by priority
        sorted_recs = [rec for _, rec in sorted(zip(priority_scores, all_recommendations), reverse=True)]
        
        return {
            "emission_level": emission_level,
            "trend": "increasing" if trend > 0 else "decreasing",
            "trend_magnitude": float(abs(trend)),
            "recommendations": sorted_recs[:5],  # Return top 5 recommendations
            "analysis": {
                "current_emissions": current_emissions,
                "historical_trend": historical_trend,
                "industry_breakdown": industry_breakdown
            }
        } 