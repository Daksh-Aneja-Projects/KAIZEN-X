from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import TwinNode, TwinEdge, TwinNodeType, EventLedger
from ..schemas import TwinGraphResponse, TwinNodeSchema, TwinEdgeSchema

router = APIRouter(prefix="/api/twin", tags=["Digital Twin"])

@router.get("/graph", response_model=TwinGraphResponse)
async def get_twin_graph(db: AsyncSession = Depends(get_db)):
    # Filter out Employee to keep node count manageable
    nodes_res = await db.execute(select(TwinNode).where(TwinNode.type != TwinNodeType.EMPLOYEE))
    nodes = nodes_res.scalars().all()
    
    node_ids = {n.id for n in nodes}
    
    # Only fetch edges between the selected nodes
    edges_res = await db.execute(select(TwinEdge).where(TwinEdge.source_id.in_(node_ids) & TwinEdge.target_id.in_(node_ids)))
    edges = edges_res.scalars().all()
    
    # Calculate overall health
    health_scores = [n.health_score for n in nodes if n.health_score is not None]
    overall_health = sum(health_scores) / len(health_scores) if health_scores else 100.0

    return {
        "nodes": nodes,
        "edges": edges,
        "overall_health": overall_health
    }

@router.get("/blast-radius/{node_id}")
async def get_blast_radius(node_id: str, db: AsyncSession = Depends(get_db)):
    # Basic simulation of finding connected nodes up to depth 2 using the postgres edges
    edges_res = await db.execute(select(TwinEdge).where((TwinEdge.source_id == node_id) | (TwinEdge.target_id == node_id)))
    edges = edges_res.scalars().all()
    
    impacted = set()
    for e in edges:
        impacted.add(e.source_id)
        impacted.add(e.target_id)
        
    return {
        "source_node": node_id,
        "radius_size": len(impacted),
        "impacted_nodes": list(impacted)
    }

@router.get("/replay")
async def get_graph_replay(db: AsyncSession = Depends(get_db)):
    # Pull event ledger to show timeline of mutations
    res = await db.execute(select(EventLedger).order_by(EventLedger.timestamp.asc()).limit(50))
    events = res.scalars().all()
    return [{"timestamp": e.timestamp.isoformat(), "entity_id": e.entity_id, "event_type": e.event_type} for e in events]

from ..services.graph_sync import GraphSyncService
from ..neo4j_db import get_neo4j_session

@router.post("/sync")
async def sync_twin(db: AsyncSession = Depends(get_db)):
    # In a real setup, neo4j_session would be managed properly per request or globally.
    from ..neo4j_db import driver
    async with driver.session() as session:
        await GraphSyncService.sync_postgres_to_neo4j(db, session)
    return {"status": "Postgres synced to Neo4j successfully"}
