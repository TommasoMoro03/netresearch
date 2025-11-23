"""
Professor chat agent using pyagentspec.
"""
from typing import Optional, List
from app.prompts.chat_prompts import PROFESSOR_CHAT_SYSTEM, PROFESSOR_CHAT_USER
from app.core.llm_factory import get_llm_config
from pyagentspec import Agent
from wayflowcore.agentspec import AgentSpecLoader


class ProfessorChatAgent:
    """
    Agent responsible for answering questions about professors and their research.
    """

    def __init__(self):
        self.llm_config = get_llm_config()
        
        # Create AgentSpec agent
        self.spec_agent = Agent(
            name="professor_chat",
            system_prompt=PROFESSOR_CHAT_SYSTEM,
            llm_config=self.llm_config
        )
        
        # Load with Wayflow
        self.agent = AgentSpecLoader().load_component(self.spec_agent)

    def ask_question(
        self,
        user_question: str,
        professor_name: str,
        professor_description: str,
        institution: Optional[str] = None,
        works_count: Optional[int] = None,
        cited_by_count: Optional[int] = None,
        h_index: Optional[int] = None,
        papers: Optional[List[dict]] = None,
        user_name: Optional[str] = None,
        user_cv: Optional[str] = None,
    ) -> str:
        """
        Answer a question about a professor based on their context.
        """
        # Format papers information
        papers_info = "None available"
        if papers and len(papers) > 0:
            paper_list = []
            for i, paper in enumerate(papers[:5], 1):  # Limit to 5 most recent papers
                title = paper.get("title", "Unknown")
                topic = paper.get("topic", "")
                year = paper.get("publication_year", "")
                abstract = paper.get("abstract", "")
                
                paper_str = f"{i}. {title}"
                if year:
                    paper_str += f" ({year})"
                if topic:
                    paper_str += f"\n   Topic: {topic}"
                if abstract:
                    # Truncate abstract to first 200 chars
                    truncated_abstract = abstract[:200] + "..." if len(abstract) > 200 else abstract
                    paper_str += f"\n   Abstract: {truncated_abstract}"
                
                paper_list.append(paper_str)
            
            papers_info = "\n\n".join(paper_list)

        # Build user message with professor context (user info ignored for now)
        user_message = PROFESSOR_CHAT_USER.format(
            user_name=user_name,
            user_cv=user_cv,
            professor_name=professor_name,
            professor_description=professor_description,
            institution=institution or "Not specified",
            works_count=works_count if works_count is not None else "Not available",
            cited_by_count=cited_by_count if cited_by_count is not None else "Not available",
            h_index=h_index if h_index is not None else "Not available",
            papers_info=papers_info,
            user_question=user_question
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
                
            # Get the last assistant message
            last_message = messages[-1]
            content = last_message.content.strip()
            
            return content

        except Exception as e:
            raise ValueError(f"Error during chat: {e}")


# Global instance
professor_chat_agent = ProfessorChatAgent()
