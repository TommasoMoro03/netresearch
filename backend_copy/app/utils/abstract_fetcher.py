"""
Utility functions for fetching paper abstracts from OpenAlex and Semantic Scholar.
"""
import requests
import time
from typing import Optional, Dict, Any


def rebuild_abstract(inverted_index: Optional[Dict[str, list]]) -> Optional[str]:
    """
    Rebuild abstract text from OpenAlex inverted index format.

    Args:
        inverted_index: Dict mapping words to list of positions

    Returns:
        Reconstructed abstract text or None
    """
    if not inverted_index:
        return None

    try:
        # Find the maximum index to create array of correct size
        max_idx = max(max(positions) for positions in inverted_index.values())
        words = [""] * (max_idx + 1)

        # Place each word at its correct positions
        for word, positions in inverted_index.items():
            for idx in positions:
                words[idx] = word

        return " ".join(words)
    except (ValueError, TypeError):
        return None


def fetch_abstract_from_semantic_scholar(doi: str) -> Optional[str]:
    """
    Fetch abstract from Semantic Scholar API using DOI.

    Args:
        doi: DOI of the paper (can be full URL or just the ID)

    Returns:
        Abstract text or None
    """
    # Clean DOI (remove https://doi.org/ prefix if present)
    doi_clean = doi.replace("https://doi.org/", "")

    url = f"https://api.semanticscholar.org/graph/v1/paper/DOI:{doi_clean}?fields=abstract"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()
        return data.get("abstract")

    except requests.RequestException:
        return None


def get_paper_abstract(work: Dict[str, Any]) -> Optional[str]:
    """
    Get abstract for a paper, trying OpenAlex first, then Semantic Scholar.

    Args:
        work: OpenAlex work object (JSON)

    Returns:
        Abstract text or None
    """
    # Try to rebuild from OpenAlex inverted index
    abstract = rebuild_abstract(work.get("abstract_inverted_index"))

    if abstract:
        return abstract

    # If no abstract from OpenAlex, try Semantic Scholar using DOI
    doi = work.get("doi")
    if doi:
        abstract = fetch_abstract_from_semantic_scholar(doi)
        if abstract:
            return abstract

    # No abstract available
    return None


def enrich_papers_with_abstracts(papers: list[Dict[str, Any]], delay: float = 0.5) -> list[Dict[str, Any]]:
    """
    Enrich a list of OpenAlex papers with abstracts.

    This function modifies papers in-place and also returns them.

    Args:
        papers: List of OpenAlex work objects
        delay: Delay in seconds between Semantic Scholar API calls (to be polite)

    Returns:
        List of papers with abstracts populated
    """
    for paper in papers:
        abstract = get_paper_abstract(paper)

        if abstract:
            paper["abstract"] = abstract
        else:
            paper["abstract"] = None

        # Small delay to be polite to external APIs
        time.sleep(delay)

    return papers
