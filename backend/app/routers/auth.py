from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.user import TokenResponse, UserLogin, UserRegister, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register_user(
    user_in: UserRegister,
    db: Annotated[Session, Depends(get_db)],
) -> TokenResponse:
    """Create a new user account and return a signed JWT token."""
    return AuthService.register(db, user_in)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate with email and password",
)
def login_user(
    credentials: UserLogin,
    db: Annotated[Session, Depends(get_db)],
) -> TokenResponse:
    """Authenticate credentials and issue a signed JWT access token."""
    return AuthService.login(db, credentials)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
)
def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """Retrieve the profile data for the authenticated bearer token user."""
    return UserResponse.model_validate(current_user)
