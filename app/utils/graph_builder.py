"""
Utility functions for building graph data (nodes and links).
"""
from typing import List, Dict, Any
from collections import defaultdict
from app.schemas.agent import GraphNode, GraphLink, Contact, Institution


def build_graph_links(professor_nodes: List[Dict[str, Any]], max_nodes: int = 10) -> List[GraphLink]:
    """
    Build links between professors based on institution hierarchy.

    Logic:
    1. Group professors by institution ID
    2. Select boss (highest h-index) for each institution
    3. Connect boss to all other professors in the same institution
    4. Create a "User" node
    5. Connect User to all bosses
    6. If max_nodes >= 5, redirect 2 childless bosses to random nodes

    Args:
        professor_nodes: List of professor GraphNode dicts
        max_nodes: Maximum number of nodes (used to determine if random connections should be made)

    Returns:
        List of GraphLink objects
    """
    links = []

    # Convert dicts back to GraphNode objects for easier access
    professors = [GraphNode(**node) for node in professor_nodes]

    # Group professors by institution ID
    institution_groups: Dict[str, List[GraphNode]] = defaultdict(list)
    orphans: List[GraphNode] = []

    for prof in professors:
        if prof.institution and prof.institution.id:
            institution_groups[prof.institution.id].append(prof)
        else:
            orphans.append(prof)

    # Find boss for each institution and create links
    bosses = []
    boss_children_count = {}  # Track how many children each boss has

    for inst_id, profs in institution_groups.items():
        if not profs:
            continue

        # Find boss (highest h-index)
        boss = max(profs, key=lambda p: p.h_index if p.h_index is not None else -1)
        bosses.append(boss)
        
        # Count children for this boss
        children_count = 0

        # Connect boss to all other professors in the institution
        for prof in profs:
            if prof.id != boss.id:
                links.append(GraphLink(
                    source=boss.id,
                    target=prof.id,
                    label="supervises"
                ))
                children_count += 1
        
        boss_children_count[boss.id] = children_count

    # Identify childless bosses (bosses with no subordinates)
    childless_bosses = [boss for boss in bosses if boss_children_count.get(boss.id, 0) == 0]
    
    # Create User node (will be added to nodes list separately)
    # Connect User to all bosses AND all orphans
    user_id = "user-node"
    
    # Determine which bosses should be redirected to random nodes
    redirected_bosses = []
    if max_nodes >= 5 and len(childless_bosses) >= 2:
        import random
        # Select 2 childless bosses to redirect
        redirected_bosses = random.sample(childless_bosses, 2)
    
    # Connect bosses
    for boss in bosses:
        if boss in redirected_bosses:
            # Redirect to a random node
            # Available targets: all professors except the boss itself and the other redirected boss
            available_targets = [p for p in professors if p.id != boss.id and p not in redirected_bosses]
            if available_targets:
                import random
                random_target = random.choice(available_targets)
                links.append(GraphLink(
                    source=boss.id,
                    target=random_target.id,
                    label="collaborates_with"
                ))
        else:
            # Normal connection to user
            links.append(GraphLink(
                source=user_id,
                target=boss.id,
                label="interested_in"
            ))
        
    # Connect orphans directly to user
    for orphan in orphans:
        links.append(GraphLink(
            source=user_id,
            target=orphan.id,
            label="interested_in"
        ))

    return links


def create_user_node() -> GraphNode:
    """
    Create a User node for the graph.

    Returns:
        GraphNode representing the user
    """
    return GraphNode(
        id="user-node",
        name="User",
        type="user",
        institution=None,
        description="You - the researcher exploring this network",
        contacts=Contact(email=None, website=None),
        works_count=None,
        cited_by_count=None,
        h_index=None,
        link_orcid=None,
        papers=None
    )
