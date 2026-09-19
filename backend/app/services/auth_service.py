from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import TokenResponse, UserLogin, UserRegister, UserResponse


class AuthService:
    @staticmethod
    def register(db: Session, user_in: UserRegister) -> TokenResponse:
        # Check if email is already in use
        existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An account with email '{user_in.email}' already exists.",
            )

        # Hash password and persist user
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            name=user_in.name.strip(),
            email=user_in.email.lower().strip(),
            password_hash=hashed_password,
            role=user_in.role.upper(),
            is_active=True,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Generate JWT token
        token = create_access_token(subject=str(db_user.id), role=db_user.role)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(db_user),
        )

    @staticmethod
    def login(db: Session, credentials: UserLogin) -> TokenResponse:
        db_user = db.query(User).filter(User.email == credentials.email.lower()).first()
        if not db_user or not verify_password(credentials.password, db_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not db_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact an administrator.",
            )

        token = create_access_token(subject=str(db_user.id), role=db_user.role)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(db_user),
        )
