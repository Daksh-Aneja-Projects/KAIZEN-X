import asyncio
import json
import random
from datetime import datetime
from ..models import Severity
from ..redis import redis_client
from faker import Faker

fake = Faker()

class EventEngine:
    def __init__(self):
        self.running = False

    async def start(self):
        self.running = True
        while self.running:
            await asyncio.sleep(random.uniform(2.0, 5.0))
            await self.generate_event()

    async def stop(self):
        self.running = False

    async def generate_event(self, force_severity=None, force_title=None):
        severities = list(Severity)
        severity = force_severity or random.choice(severities)
        title = force_title or fake.catch_phrase()
        
        event = {
            "id": fake.uuid4(),
            "timestamp": datetime.utcnow().isoformat(),
            "title": title,
            "description": fake.bs(),
            "severity": severity.value,
            "source": random.choice(["System", "Vendor API", "Sensor", "Audit", "Financial Integration"]),
            "affected_entities": [fake.company() for _ in range(random.randint(1, 3))],
            "impact_score": random.uniform(1.0, 10.0)
        }
        
        await redis_client.publish("enterprise_events", json.dumps(event))
