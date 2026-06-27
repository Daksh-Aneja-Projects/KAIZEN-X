from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import TwinNode, TwinEdge
from ..neo4j_db import get_neo4j_session
import uuid

class GraphSyncService:
    @staticmethod
    async def sync_postgres_to_neo4j(pg_db: AsyncSession, neo4j_session):
        nodes_res = await pg_db.execute(select(TwinNode))
        edges_res = await pg_db.execute(select(TwinEdge))
        nodes = nodes_res.scalars().all()
        edges = edges_res.scalars().all()

        # Clear existing graph (Hackathon shortcut)
        await neo4j_session.run("MATCH (n) DETACH DELETE n")

        # Insert nodes
        node_query = """
        UNWIND $nodes AS node
        CALL apoc.create.node([node.type, 'Entity'], {
            id: node.id,
            label: node.label,
            status: node.status,
            health_score: node.health_score
        }) YIELD node AS n
        RETURN count(n)
        """
        # Note: apoc is required for dynamic labels. Since we might not have apoc installed in the standard neo4j image, we'll use a static merge with generic 'Entity' and property type.
        
        fallback_node_query = """
        UNWIND $nodes AS node
        CREATE (n:Entity {
            id: node.id,
            label: node.label,
            type: node.type,
            status: node.status,
            health_score: node.health_score
        })
        """
        nodes_data = [{"id": n.id, "label": n.label, "type": n.type.name, "status": n.status, "health_score": n.health_score} for n in nodes]
        await neo4j_session.run(fallback_node_query, nodes=nodes_data)

        # Insert edges
        edge_query = """
        UNWIND $edges AS edge
        MATCH (source:Entity {id: edge.source_id})
        MATCH (target:Entity {id: edge.target_id})
        CALL apoc.create.relationship(source, edge.type, {id: edge.id, weight: edge.weight}, target) YIELD rel
        RETURN count(rel)
        """
        
        # Fallback for dynamic relationships without APOC: create generic RELATIONSHIP and set type prop
        fallback_edge_query = """
        UNWIND $edges AS edge
        MATCH (source:Entity {id: edge.source_id})
        MATCH (target:Entity {id: edge.target_id})
        CREATE (source)-[r:RELATES_TO {id: edge.id, weight: edge.weight, rel_type: edge.type}]->(target)
        """
        edges_data = [{"id": e.id, "source_id": e.source_id, "target_id": e.target_id, "type": e.type.name, "weight": e.weight} for e in edges]
        await neo4j_session.run(fallback_edge_query, edges=edges_data)
        
        print("Graph sync to Neo4j complete.")
