import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Recommendations = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('http://localhost:8000/countries');
        setCountries(response.data.countries);
      } catch (err) {
        setError('Error fetching countries list');
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedCountry) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:8000/recommendations/${selectedCountry}`
        );
        setRecommendations(response.data);
      } catch (err) {
        setError('Error fetching recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedCountry]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const getEmissionLevelColor = (level) => {
    switch (level) {
      case 'high_emissions':
        return 'error';
      case 'medium_emissions':
        return 'warning';
      case 'low_emissions':
        return 'success';
      default:
        return 'default';
    }
  };

  const getEmissionLevelLabel = (level) => {
    switch (level) {
      case 'high_emissions':
        return 'High Emissions';
      case 'medium_emissions':
        return 'Medium Emissions';
      case 'low_emissions':
        return 'Low Emissions';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Emission Reduction Recommendations
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select Country</InputLabel>
              <Select
                value={selectedCountry}
                onChange={handleCountryChange}
                label="Select Country"
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {loading ? (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          </Grid>
        ) : error ? (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        ) : recommendations ? (
          <>
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Current Status
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Chip
                        label={getEmissionLevelLabel(recommendations.emission_level)}
                        color={getEmissionLevelColor(recommendations.emission_level)}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center">
                        {recommendations.trend === 'increasing' ? (
                          <TrendingUpIcon color="error" sx={{ mr: 1 }} />
                        ) : (
                          <TrendingDownIcon color="success" sx={{ mr: 1 }} />
                        )}
                        <Typography>
                          Emissions are {recommendations.trend} at a rate of{' '}
                          {recommendations.trend_magnitude.toFixed(2)} tons per year
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Industry Breakdown
                  </Typography>
                  <List>
                    {Object.entries(recommendations.analysis.industry_breakdown).map(
                      ([industry, percentage]) => (
                        <ListItem key={industry}>
                          <ListItemIcon>
                            <LightbulbIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={industry.charAt(0).toUpperCase() + industry.slice(1)}
                            secondary={`${(percentage * 100).toFixed(1)}% of total emissions`}
                          />
                        </ListItem>
                      )
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recommended Actions
                  </Typography>
                  <List>
                    {recommendations.recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" align="center">
              Please select a country to view recommendations
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Recommendations; 