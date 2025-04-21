import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const DataUpload = () => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      
      // Preview the file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const rows = text.split('\n').slice(0, 6); // Show first 5 rows
          setPreviewData(rows);
        } catch (err) {
          setError('Error reading file. Please make sure it is a valid CSV file.');
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload-data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('File uploaded successfully!');
      setPreviewData(null);
      setFile(null);
      
      // Display statistics
      setSuccess(prev => (
        <Box>
          <Typography variant="body1" color="success.main">
            File uploaded successfully!
          </Typography>
          <Typography variant="body2">
            Total Countries: {response.data.total_countries}
          </Typography>
          <Typography variant="body2">
            Year Range: {response.data.year_range.min} - {response.data.year_range.max}
          </Typography>
          <Typography variant="body2">
            Average Emissions: {response.data.emissions_stats.mean.toFixed(2)} tons
          </Typography>
        </Box>
      ));
    } catch (err) {
      setError(err.response?.data?.detail || 'Error uploading file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload Emissions Data
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <input
            accept=".csv,.xlsx"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ mr: 2 }}
            >
              Select File
            </Button>
          </label>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </Box>

        {file && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            Selected file: {file.name}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {previewData && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {previewData[0].split(',').map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.slice(1).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.split(',').map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          File Requirements
        </Typography>
        <Typography variant="body1" paragraph>
          Please ensure your file meets the following requirements:
        </Typography>
        <ul>
          <li>File format: CSV or Excel (.xlsx)</li>
          <li>Required columns: country, year, co2_emissions</li>
          <li>CO₂ emissions should be in metric tons</li>
          <li>Year should be in YYYY format</li>
          <li>Country names should be in English</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default DataUpload; 