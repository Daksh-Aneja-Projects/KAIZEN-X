import asyncio
import os
import uuid
from datetime import datetime, timedelta
from app.database import AsyncSessionLocal
from app.models import EventLedger

async def run():
    async with AsyncSessionLocal() as db:
        base_time = datetime.utcnow() - timedelta(minutes=5)
        
        events = [
            EventLedger(id=str(uuid.uuid4()), timestamp=base_time, entity_type="Node", entity_id="VEN-ALPHA", event_type="Risk Propagated", payload={"risk": "Supplier Delay"}),
            EventLedger(id=str(uuid.uuid4()), timestamp=base_time + timedelta(seconds=10), entity_type="Node", entity_id="SYS-ERP", event_type="Throughput Dropped", payload={"value": "-15%"}),
            EventLedger(id=str(uuid.uuid4()), timestamp=base_time + timedelta(seconds=25), entity_type="Node", entity_id="PROJ-PHOENIX", event_type="Timeline Delayed", payload={"days": 14})
        ]
        
        db.add_all(events)
        await db.commit()
        print(f"Seeded {len(events)} events to the ledger!")

if __name__ == "__main__":
    asyncio.run(run())
