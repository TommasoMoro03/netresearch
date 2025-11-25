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
from app.core.llm_factory import get_llm_config
from pyagentspec import Agent
from wayflowcore.agentspec import AgentSpecLoader


class IntentExtractionAgent:
    """
    Agent responsible for extracting filters from user query and CV.
    """

    def __init__(self):

        self.llm_config = get_llm_config()
        
        # Create AgentSpec agent
        self.spec_agent = Agent(
            name="intent_extractor",
            system_prompt=INTENT_EXTRACTION_SYSTEM,
            llm_config=self.llm_config
        )
        
        # Load with Wayflow
        self.agent = AgentSpecLoader().load_component(self.spec_agent)

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

        # Call LLM via Wayflow
        try:
            # Start conversation
            conv = self.agent.start_conversation()
            conv.append_user_message(user_message)
            
            # Execute
            conv.execute()
            
            # Get response
            messages = conv.get_messages()
            if not messages:
                raise ValueError("No response from agent")
                
            # Assuming the last message is from the assistant
            last_message = messages[-1]
            content = last_message.content.strip()

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
