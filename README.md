# AI-Based Crop Recommendation for Farmers 🌾🌱

A full-stack, Machine Learning-powered web application that recommends the top 3 most suitable crops for a farmer based on soil and environmental conditions. 

## Features
- **Machine Learning**: Powered by a robust Scikit-learn `RandomForestClassifier` trained on agricultural datasets.
- **Backend API**: Fast and scalable Python API using `FastAPI`.
- **Frontend Dashboard**: A stunning, responsive, and glassmorphism-styled UI built with React & Vite.
- **Top 3 Insights**: Gives the top 3 crop recommendations with confidence scores and explanations.

---

## 🛠️ Project Structure
```
Crop_Recommendation_System/
│
├── backend/
│   ├── ml_model/
│   │   ├── train_model.py     # Script to generate data & train the model
│   │   ├── model.joblib       # Compiled Random Forest model
│   │   └── *_encoder.joblib   # Label encoders for data preprocessing
│   └── main.py                # FastAPI endpoints
│
├── frontend/                  # React Application (Vite)
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── App.jsx            # Main app page & API hookup
│   │   └── index.css          # Styling & Aesthetics
│   └── package.json
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Setup the Backend
Open a terminal in the root directory:
```bash
# Activate the virtual environment
.\venv\Scripts\Activate.ps1   # (Windows)
# or source venv/bin/activate # (Mac/Linux)

# Ensure dependencies are installed (already done via setup)
pip install fastapi uvicorn scikit-learn pandas pydantic joblib

# Optional: Re-train the model
python backend\ml_model\train_model.py

# Start the FastAPI Server
python backend\main.py
```
*Backend will run at `http://localhost:8000`*

### 2. Setup the Frontend
Open a new terminal in the `frontend/` directory:
```bash
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*Frontend will run at `http://localhost:5173`*

Open the browser to the Vite local URL to view the app!

---

## 🌍 Deployment Guide

This app is beautifully structured for separated deployment using Render (Backend) and Netlify (Frontend).

### Deploying the Backend on Render (Render.com)
1. Push this repository to GitHub.
2. In Render, create a new **Web Service**.
3. Connect your repository.
4. Set the Root Directory to `backend` (or leave empty if configured via Procfile).
5. Build Command: `pip install -r requirements.txt` *(Note: you will need to generate a requirements.txt with `pip freeze > backend/requirements.txt` before pushing).*
6. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Click **Deploy**. Copy the resulting API URL.

### Deploying the Frontend on Netlify (Netlify.com)
1. In Netlify, click **Import from GitHub**.
2. Select your repository.
3. Set the Base directory to `frontend`.
4. Build Command: `npm run build`
5. Publish Directory: `frontend/dist`
6. **Important**: Add an Environment Variable in Netlify:
   - Key: `VITE_API_URL`
   - Value: `<YOUR_RENDER_BACKEND_URL>`
7. Click **Deploy Site**.

Enjoy your AI-powered Farmer Assistant! 🚜
