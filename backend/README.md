# Backend API

This is a Flask-based backend API.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- On macOS/Linux:
```bash
source venv/bin/activate
```
- On Windows:
```bash
.\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

To run the application in development mode:

```bash
python app.py
```

The server will start on http://localhost:5000

## API Endpoints

- `GET /api/health`: Health check endpoint
  - Returns the status of the server 