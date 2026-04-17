"""JWT auth middleware for FastAPI"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth import decode_access_token

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Decode JWT and return user payload"""
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return {"email": payload.get("sub"), "role": payload.get("role")}


async def require_company(user=Depends(get_current_user)):
    """Require company role"""
    if user.get("role") != "company":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Company access required")
    return user


async def require_user(user=Depends(get_current_user)):
    """Require user role"""
    if user.get("role") != "user":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User access required")
    return user
