import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const Dashboard = () => {
  const [mapData, setMapData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2018);
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emissionsRange, setEmissionsRange] = useState({ min: 0, max: 200 });

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get('http://localhost:8000/available-years');
        setAvailableYears(response.data.years);
        setSelectedYear(response.data.years[response.data.years.length - 1]);
      } catch (error) {
        console.error('Error fetching years:', error);
      }
    };

    const fetchEmissionsRange = async () => {
      try {
        const response = await axios.get('http://localhost:8000/emissions-range');
        setEmissionsRange(response.data);
      } catch (error) {
        console.error('Error fetching emissions range:', error);
      }
    };

    fetchYears();
    fetchEmissionsRange();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedYear) return;

      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/emissions/${selectedYear}`);
        setMapData(response.data);
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  const getColor = (value) => {
    // Similar to the example map's color scheme
    if (value > 200) return '#67000d';
    if (value > 100) return '#a50f15';
    if (value > 50) return '#cb181d';
    if (value > 20) return '#ef3b2c';
    if (value > 10) return '#fb6a4a';
    if (value > 5) return '#fc9272';
    if (value > 2) return '#fcbba1';
    if (value > 1) return '#fee0d2';
    return '#fff5f0';
  };

  const style = (feature) => {
    return {
      fillColor: getColor(feature.properties.emissions),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Per capita CO₂ emissions from domestic aviation, {selectedYear}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Domestic aviation represents flights which depart and arrive within the same country.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                label="Select Year"
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, height: '600px' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : (
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {mapData && (
                  <GeoJSON
                    data={mapData}
                    style={style}
                    onEachFeature={(feature, layer) => {
                      layer.bindTooltip(
                        `${feature.properties.name}: ${feature.properties.emissions.toFixed(2)} kg`,
                        { sticky: true }
                      );
                    }}
                  />
                )}
              </MapContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Legend (kg CO₂ per capita)
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              {[0, 1, 2, 5, 10, 20, 50, 100, 200].map((value, index, arr) => (
                <Box key={value} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 20,
                      backgroundColor: getColor(value),
                      border: '1px solid #ccc',
                    }}
                  />
                  <Typography variant="caption">
                    {index === arr.length - 1 ? `${value}+` : value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
        Data source: World Bank - CO₂ emissions from domestic aviation
      </Typography>
    </Box>
  );
};

export default Dashboard; 