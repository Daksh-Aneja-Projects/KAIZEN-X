import json
import uuid
import os
from datetime import datetime
from ...models import EventLedger
from sqlalchemy.ext.asyncio import AsyncSession
from ...redis import redis_client

class EnterpriseEngine:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.graph_state = {}

    async def load_baseline(self):
        """Loads the deterministic JSON baseline into the graph state."""
        pack_path = os.path.join(os.path.dirname(__file__), "../../knowledge/enterprise/pack.json")
        with open(pack_path, "r") as f:
            pack = json.load(f)
            
        # In-memory graph state for deterministic analysis
        for dept in pack["departments"]:
            self.graph_state[dept["id"]] = dept
        for vendor in pack["vendors"]:
            self.graph_state[vendor["id"]] = vendor
        for app in pack["applications"]:
            self.graph_state[app["id"]] = app
        for proj in pack["projects"]:
            self.graph_state[proj["id"]] = proj
            
        # Emit baseline loaded event
        await self._emit_event("System", "BASELINE_LOADED", {"version": pack["version"]})

    async def apply_mutation(self, target_id: str, mutation_payload: dict, source: str = "ScenarioEngine"):
        """Event-sourced mutation of the enterprise graph."""
        
        # 1. Mutate in-memory state
        if target_id in self.graph_state:
            node = self.graph_state[target_id]
            for k, v in mutation_payload.items():
                node[k] = v
                
        # 2. Persist immutable event
        event_id = str(uuid.uuid4())
        event = EventLedger(
            id=event_id,
            entity_type="Node",
            entity_id=target_id,
            event_type="MUTATION",
            payload=mutation_payload
        )
        self.db.add(event)
        await self.db.commit()

        # 3. Publish to live websocket subscribers
        ws_event = {
            "id": event_id,
            "timestamp": datetime.utcnow().isoformat(),
            "title": f"State Mutation: {target_id}",
            "description": f"Applied mutation: {mutation_payload}",
            "severity": "CRITICAL" if "status" in mutation_payload and mutation_payload["status"] == "BANKRUPT" else "MEDIUM",
            "source": source,
            "affected_entities": [target_id],
            "impact_score": mutation_payload.get("impact_multiplier", 1.0) * 10
        }
        await redis_client.publish("enterprise_events", json.dumps(ws_event))

    async def _emit_event(self, entity_type: str, event_type: str, payload: dict):
        event = EventLedger(
            id=str(uuid.uuid4()),
            entity_type=entity_type,
            entity_id="SYSTEM",
            event_type=event_type,
            payload=payload
        )
        self.db.add(event)
        await self.db.commit()
        
    def get_current_graph_state(self):
        return self.graph_state
