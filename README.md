# CO₂ Emissions Prediction

A full-stack web application for predicting CO₂ emissions using machine learning models. The application provides both historical emissions data visualization and future emissions predictions based on various factors.

## Features

- Historical CO₂ emissions data visualization
- Machine learning-based emissions predictions
- Interactive data exploration
- REST API for data access and predictions
- Modern web interface

## Tech Stack

### Backend
- Python 3.12+
- FastAPI
- Pandas
- NumPy
- Machine Learning models

### Frontend
- React
- TypeScript
- Modern UI components

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
python main.py
```

The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## API Documentation

Once the backend server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

MIT 
