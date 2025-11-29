"""Google OAuth service for authentication."""
from typing import Optional, Dict
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings


class GoogleOAuthService:
    """Service for Google OAuth authentication."""

    def __init__(self):
        """Initialize Google OAuth service with client ID from settings."""
        self.client_id = settings.GOOGLE_CLIENT_ID
        if not self.client_id:
            raise ValueError("GOOGLE_CLIENT_ID not configured in settings")

    async def verify_token(self, token: str) -> Optional[Dict[str, str]]:
        """
        Verify Google ID token and extract user information.

        Args:
            token: Google ID token to verify

        Returns:
            Dictionary with user info (email, name, sub) if valid, None otherwise

        Raises:
            ValueError: If token is invalid or verification fails
        """
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                self.client_id
            )

            # Token is valid, extract user information
            return {
                "email": idinfo.get("email"),
                "name": idinfo.get("name"),
                "google_id": idinfo.get("sub"),
                "email_verified": idinfo.get("email_verified", False)
            }
        except ValueError as e:
            # Invalid token
            raise ValueError(f"Invalid Google token: {str(e)}")
        except Exception as e:
            # Other errors
            raise ValueError(f"Token verification failed: {str(e)}")
