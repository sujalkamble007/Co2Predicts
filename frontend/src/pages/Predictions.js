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
} from '@mui/material';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Predictions = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [historicalData, setHistoricalData] = useState([]);
  const [predictions, setPredictions] = useState([]);
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
    const fetchData = async () => {
      if (!selectedCountry) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch historical data
        const historyResponse = await axios.get(
          `http://localhost:8000/country-data/${selectedCountry}`
        );
        setHistoricalData(historyResponse.data.data);

        // Fetch predictions
        const predictionResponse = await axios.get(
          `http://localhost:8000/predict/${selectedCountry}`
        );
        setPredictions(predictionResponse.data.predictions);
      } catch (err) {
        setError('Error fetching data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCountry]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const combinedData = [
    ...historicalData.map(item => ({
      year: item.year,
      emissions: item.co2_emissions,
      type: 'Historical',
    })),
    ...predictions.map(item => ({
      year: item.year,
      emissions: item.predicted_emissions,
      type: 'Predicted',
    })),
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        CO₂ Emissions Predictions
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

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, height: '500px' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : selectedCountry ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedCountry} - Historical and Predicted CO₂ Emissions
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="year"
                      label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      label={{
                        value: 'CO₂ Emissions (tons)',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="emissions"
                      stroke="#8884d8"
                      name="Emissions"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                Please select a country to view predictions
              </Typography>
            )}
          </Paper>
        </Grid>

        {selectedCountry && predictions.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Prediction Summary
              </Typography>
              <Grid container spacing={2}>
                {predictions.map((prediction) => (
                  <Grid item xs={12} sm={6} md={4} key={prediction.year}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1">
                        {prediction.year}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {prediction.predicted_emissions.toFixed(2)} tons
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Predictions; 