from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import joblib
import numpy as np
import os
import uvicorn
from jose import JWTError, jwt

# Import local modules
import database
import models
import schemas
import auth
from routes import ai_chat

# Initialize DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="CropWise - AI Crop Advisor API")
app.include_router(ai_chat.router)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the ML model and Encoders
MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_model")
MODEL_PATH = os.path.join(MODEL_DIR, "model.joblib")
ENCODER_PATH = os.path.join(MODEL_DIR, "soil_encoder.joblib")
LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.joblib")

model = None
soil_map = None
label_encoder = None

@app.on_event("startup")
def load_model_and_seed():
    global model, soil_map, label_encoder
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH) and os.path.exists(LABEL_ENCODER_PATH):
        model = joblib.load(MODEL_PATH)
        soil_map = joblib.load(ENCODER_PATH)
        label_encoder = joblib.load(LABEL_ENCODER_PATH)
        print("ML Models loaded successfully.")
    else:
        print("Warning: ML Model not found! Please run train_model.py first.")
    
    # Seed demo user and history if empty
    db = database.SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == "demo@cropwise.com").first()
        if not user:
            hashed_password = auth.get_password_hash("demo123")
            user = models.User(email="demo@cropwise.com", full_name="Demo Farmer", password_hash=hashed_password)
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Preload demo recommendation
            demo_history = models.PredictionHistory(
                user_id=user.id,
                crop_name="Wheat",
                confidence=94.5,
                location="Punjab, India",
                season="Rabi",
                temperature=22.5,
                rainfall=65.0,
                farm_size=12.5,
                water_availability="Adequate",
                soil_type="Loamy",
                ph=6.8,
                n=45.0,
                p=40.0,
                k=42.0,
                humidity=55.0
            )
            db.add(demo_history)
            db.commit()
            print("Demo user and history seeded successfully.")
    finally:
        db.close()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

# Crop Explanations Generator
def get_explanation(crop_name):
    explanations = {
        'rice': 'Rice thrives in waterlogged clay/loamy soils with high rainfall.',
        'maize': 'Maize needs well-drained loamy soil, moderate temp, and good Nitrogen.',
        'chickpea': 'Chickpeas perfectly adapt to loamy/black soils with low humidity.',
        'cotton': 'Cotton requires black soil, high temperature, and specific humidity conditions.',
        'apple': 'Apples flourish in cool temperatures, high altitude loamy/red soils.',
        'watermelon': 'Watermelons love sandy/loamy soils and warm, sunny climates.'
    }
    return explanations.get(crop_name, f"{crop_name.capitalize()} is highly suitable for your entered soil profile and climatic conditions.")

# --- Authentication Endpoints ---

@app.post("/api/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not auth.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- Prediction Endpoints ---

@app.post("/api/predict", response_model=schemas.PredictionResponse)
def predict_crop(request: schemas.PredictionRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if not model:
        raise HTTPException(status_code=500, detail="Server Model Error: Model is not initialized.")
    
    # Preprocess
    soil_validated = request.soil_type.capitalize()
    if soil_validated not in soil_map:
        raise HTTPException(status_code=400, detail=f"Invalid soil type: {request.soil_type}. Expected one of {list(soil_map.keys())}")
    
    soil_encoded = soil_map[soil_validated]
    
    # Feature array matching training exactly: [N, P, K, temperature, humidity, ph, rainfall, Soil_Type_Encoded]
    features = np.array([[
        request.n, request.p, request.k, 
        request.temperature, request.humidity, 
        request.ph, request.rainfall, 
        soil_encoded
    ]])
    
    # Predict probabilities to get Top 3
    probabilities = model.predict_proba(features)[0]
    top_3_indices = np.argsort(probabilities)[::-1][:3]
    
    results = []
    top_crop_name = ""
    top_confidence = 0.0
    
    for idx, index in enumerate(top_3_indices):
        crop_label = label_encoder.inverse_transform([index])[0]
        confidence = round(probabilities[index] * 100, 2)
        results.append({
            "crop": crop_label.capitalize(),
            "confidence": confidence,
            "explanation": get_explanation(crop_label)
        })
        
        # Save highest confidence crop for history
        if idx == 0:
            top_crop_name = crop_label.capitalize()
            top_confidence = confidence
    
    # Save to history
    history_entry = models.PredictionHistory(
        user_id=current_user.id,
        crop_name=top_crop_name,
        confidence=top_confidence,
        location=request.farm_location,
        season=request.growing_season,
        temperature=request.temperature,
        rainfall=request.rainfall,
        farm_size=request.farm_size,
        water_availability=request.water_availability,
        soil_type=request.soil_type,
        ph=request.ph,
        n=request.n,
        p=request.p,
        k=request.k,
        humidity=request.humidity
    )
    db.add(history_entry)
    db.commit()
    
    return {"predictions": results}

@app.get("/api/history", response_model=List[schemas.HistoryResponse])
def get_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    history = db.query(models.PredictionHistory).filter(models.PredictionHistory.user_id == current_user.id).order_by(models.PredictionHistory.date.desc()).all()
    return history

@app.delete("/api/history/all")
def clear_all_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    db.query(models.PredictionHistory).filter(models.PredictionHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All history cleared"}

@app.delete("/api/history/{history_id}")
def delete_history_item(history_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    history_item = db.query(models.PredictionHistory).filter(models.PredictionHistory.id == history_id, models.PredictionHistory.user_id == current_user.id).first()
    if not history_item:
        raise HTTPException(status_code=404, detail="History item not found")
    
    db.delete(history_item)
    db.commit()
    return {"message": "History item deleted"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
