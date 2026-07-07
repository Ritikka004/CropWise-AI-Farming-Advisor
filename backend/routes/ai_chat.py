from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from pydantic import BaseModel

import auth
import database
import models
from services.ai_service import generate_ai_response

router = APIRouter(prefix="/api/ai", tags=["AI Advisor"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")


class AIChatRequest(BaseModel):
    message: str
    prediction: Dict[str, Any]
    history: Optional[List[Dict[str, Any]]] = []


class AIChatResponse(BaseModel):
    response: str


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/chat", response_model=AIChatResponse)
def chat_with_ai(request: AIChatRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    response = generate_ai_response(
        message=request.message,
        prediction=request.prediction,
        history=request.history,
        db=db,
        user_id=current_user.id,
    )
    return {"response": response}
