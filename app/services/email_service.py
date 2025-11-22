import openai
from app.core.config import settings
from typing import Optional

class EmailService:
    """
    Service for generating and sending emails using LLM.
    """

    def __init__(self):
        # Initialize OpenAI client for Together AI
        # We use the helper from config to get the correct base_url and api_key
        config = settings.get_openai_client_config()
        self.client = openai.OpenAI(**config)
        self.model = settings.MODEL_NAME

    def generate_email(self, topic: str, recipient_name: Optional[str] = "Colleague") -> str:
        """
        Generate an email draft based on a topic.
        
        Args:
            topic: The subject or topic of the email.
            recipient_name: Name of the recipient (optional).
            
        Returns:
            Generated email content.
        """
        prompt = f"""
        You are a professional assistant. Write a professional email to {recipient_name} about the following topic:
        
        Topic: {topic}
        
        The email should be concise, polite, and professional.
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful professional assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating email: {e}")
            raise e

    def send_email(self, email_content: str, recipient_email: str) -> bool:
        """
        Send an email (Mock implementation).
        
        Args:
            email_content: The body of the email.
            recipient_email: The recipient's email address.
            
        Returns:
            True if sent successfully (mocked).
        """
        # TODO: Implement real email sending logic
        print(f"Sending email to {recipient_email}...")
        print(f"Content: {email_content[:50]}...")
        return True

# Global instance
email_service = EmailService()
