import asyncio
import json
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import EventLedger
from ..redis import redis_client
from .confidence_engine import ConfidenceEngine

class PropagationEngine:
    def __init__(self, db: AsyncSession, neo4j_session):
        self.db = db
        self.neo4j_session = neo4j_session

    async def propagate_failure(self, start_node_id: str, severity: str, time_horizon: int = 30):
        # We perform a custom weighted BFS inside Python by fetching the graph from Neo4j
        # Or using a cypher query to get paths up to a certain depth.
        # For cinematic hackathon demo, propagating step-by-step with delay is best.
        
        query = """
        MATCH (start:Entity {id: $start_id})-[r:RELATES_TO*1..3]->(affected:Entity)
        RETURN start.id AS start, affected.id AS target, [rel IN r | rel.weight] AS weights, length(r) AS depth, affected.label AS label
        ORDER BY depth
        """
        
        result = await self.neo4j_session.run(query, start_id=start_node_id)
        records = await result.data()
        
        # Log to ledger
        ledger_entry = EventLedger(
            id=str(uuid.uuid4()),
            entity_type="Node",
            entity_id=start_node_id,
            event_type="PropagationStarted",
            payload={"severity": severity, "time_horizon": time_horizon}
        )
        self.db.add(ledger_entry)
        await self.db.commit()

        visited = set([start_node_id])
        current_step = 1
        
        for record in records:
            target_id = record["target"]
            if target_id in visited:
                continue
                
            depth = record["depth"]
            weights = record["weights"]
            
            # Decay calculation
            decay_factor = 0.8
            cumulative_weight = sum(weights) / len(weights) if weights else 1.0
            impact_score = (decay_factor ** depth) * cumulative_weight
            
            # Confidence Calculation
            confidence_metrics = ConfidenceEngine.calculate_confidence(depth, 0.9, 0.85)
            
            if impact_score > 0.1:
                visited.add(target_id)
                
                step_event = {
                    "id": str(uuid.uuid4()),
                    "type": "PROPAGATION_STEP",
                    "node_id": target_id,
                    "label": record["label"],
                    "step": depth,
                    "impact_score": round(impact_score * 100, 2),
                    "confidence": confidence_metrics["confidence"],
                    "severity": "CRITICAL" if impact_score > 0.8 else ("HIGH" if impact_score > 0.5 else "MEDIUM"),
                    "time_to_impact": depth * 2,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                # Broadcast
                await redis_client.publish("enterprise_events", json.dumps(step_event))
                
                # Log step to ledger
                step_ledger = EventLedger(
                    id=str(uuid.uuid4()),
                    entity_type="Node",
                    entity_id=target_id,
                    event_type="PropagationStep",
                    payload=step_event
                )
                self.db.add(step_ledger)
                await self.db.commit()
                
                await asyncio.sleep(0.8) # Cinematic delay
        
        # Log completion
        end_ledger = EventLedger(
            id=str(uuid.uuid4()),
            entity_type="Scenario",
            entity_id=start_node_id,
            event_type="PropagationCompleted",
            payload={"nodes_affected": len(visited)}
        )
        self.db.add(end_ledger)
        await self.db.commit()
