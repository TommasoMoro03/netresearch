"""
Intent extraction agent using pyagentspec.
"""
import json
from typing import Optional, List
from app.agents.models import ExtractedFilters, AgentContext
from app.prompts.intent_extraction import (
    INTENT_EXTRACTION_SYSTEM,
    INTENT_EXTRACTION_USER,
    CV_CONTEXT_TEMPLATE
)
from app.core.llm_factory import get_openai_client
from app.core.config import settings


class IntentExtractionAgent:
    """
    Agent responsible for extracting filters from user query and CV.
    """

    def __init__(self):
        self.client = get_openai_client()
        self.model = settings.MODEL_NAME

    def extract_filters(
        self,
        query: str,
        cv_concepts: Optional[List[str]] = None
    ) -> ExtractedFilters:
        """
        Extract research filters from query and optional CV context.

        Args:
            query: User's research query
            cv_concepts: Optional list of concepts from user's CV

        Returns:
            ExtractedFilters with topics, geographical_areas, and research_types

        Raises:
            ValueError: If LLM response is invalid
        """
        # Build CV context if available
        cv_context = ""
        if cv_concepts:
            cv_context = CV_CONTEXT_TEMPLATE.format(
                cv_concepts=", ".join(cv_concepts)
            )

        # Build user message with placeholders
        user_message = INTENT_EXTRACTION_USER.format(
            query=query,
            cv_context=cv_context
        )

        # Call LLM
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": INTENT_EXTRACTION_SYSTEM},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.3,  # Lower temperature for more consistent extraction
                max_tokens=500
            )

            # Parse JSON response
            content = response.choices[0].message.content.strip()

            # Try to extract JSON if wrapped in markdown code blocks
            if content.startswith("```"):
                # Remove markdown code blocks
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:].strip()

            filters_dict = json.loads(content)

            # Validate and create ExtractedFilters
            return ExtractedFilters(**filters_dict)

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse LLM response as JSON: {e}")
        except Exception as e:
            raise ValueError(f"Error during filter extraction: {e}")

    def extract_with_context(self, context: AgentContext) -> ExtractedFilters:
        """
        Extract filters using AgentContext.

        Args:
            context: Agent execution context

        Returns:
            ExtractedFilters
        """
        return self.extract_filters(
            query=context.query,
            cv_concepts=context.cv_concepts
        )
