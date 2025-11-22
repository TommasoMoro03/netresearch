"""
Prompts for intent and filter extraction from user queries.
"""

INTENT_EXTRACTION_SYSTEM = """You are an expert research assistant that helps analyze user queries to extract research filters.

Your task is to analyze the user's query and their CV (if provided) to extract relevant filters for academic research search.

You must extract:
1. **Topics**: List of research topics, fields, or keywords (e.g., ["Machine Learning", "Robotics", "Computer Vision"])
2. **Geographical Areas**: Countries, regions, or continents mentioned (e.g., ["Europe", "Switzerland", "United States"])
3. **Research Types**: Type of research output (e.g., ["papers", "labs", "professors", "institutions"])

Be specific and comprehensive. If the CV is provided, use it to infer additional relevant topics based on the user's expertise.

You MUST respond in valid JSON format with this exact structure:
{
    "topics": ["topic1", "topic2", ...],
    "geographical_areas": ["area1", "area2", ...],
    "research_types": ["type1", "type2", ...]
}
"""

INTENT_EXTRACTION_USER = """User Query: {query}

{cv_context}

Extract the research filters from this query and respond ONLY with valid JSON."""

CV_CONTEXT_TEMPLATE = """User's CV Context:
The user has expertise in: {cv_concepts}

Use this information to enrich the topic filters."""
