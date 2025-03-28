from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import User
from ..main import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class AuthService:
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Generate password hash."""
        return pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    async def get_current_user(self, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
        """Get current user from JWT token."""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            email: str = payload.get("sub")
            if email is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception
        
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise credentials_exception
        return user

    async def get_current_active_user(self, current_user: User = Depends(get_current_user)) -> User:
        """Get current active user."""
        if not current_user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return current_user

    async def authenticate_user(self, email: str, password: str, db: Session) -> Optional[User]:
        """Authenticate a user by email and password."""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    async def create_user(self, email: str, password: str, full_name: str, db: Session) -> User:
        """Create a new user."""
        hashed_password = self.get_password_hash(password)
        db_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    async def update_user_password(self, user: User, new_password: str, db: Session) -> User:
        """Update user password."""
        user.hashed_password = self.get_password_hash(new_password)
        db.commit()
        db.refresh(user)
        return user

    async def deactivate_user(self, user: User, db: Session) -> User:
        """Deactivate a user account."""
        user.is_active = False
        db.commit()
        db.refresh(user)
        return user

    async def activate_user(self, user: User, db: Session) -> User:
        """Activate a user account."""
        user.is_active = True
        db.commit()
        db.refresh(user)
        return user

    def check_permissions(self, user: User, required_role: str) -> bool:
        """Check if user has required role permissions."""
        return user.role == required_role or user.is_superuser 