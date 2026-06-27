import json
import asyncio
import os
from datetime import datetime
import uuid
from typing import Dict, Any
from .state.enterprise_engine import EnterpriseEngine
from ..knowledge.schemas import ScenarioDefinition

class ScenarioEngine:
    def __init__(self, enterprise_engine: EnterpriseEngine):
        self.enterprise_engine = enterprise_engine
        self.active_scenario: ScenarioDefinition = None

    async def load_scenario(self, scenario_filename: str):
        path = os.path.join(os.path.dirname(__file__), f"../../knowledge/scenarios/{scenario_filename}")
        with open(path, "r") as f:
            data = json.load(f)
            
        self.active_scenario = ScenarioDefinition(**data)
        print(f"Loaded scenario: {self.active_scenario.name}")
        
    async def run(self):
        if not self.active_scenario:
            raise ValueError("No scenario loaded")
            
        print(f"Executing scenario: {self.active_scenario.name}")
        
        # Ensure baseline is loaded
        await self.enterprise_engine.load_baseline()
        
        # Fire initial trigger
        trigger = self.active_scenario.trigger
        await self.enterprise_engine.apply_mutation(
            target_id=trigger.target_id,
            mutation_payload=trigger.payload,
            source="ScenarioEngine-Trigger"
        )
        
        # Execute timeline events
        start_time = datetime.utcnow()
        for event in self.active_scenario.timeline:
            # For demonstration purposes, we will sleep briefly to simulate time passing, 
            # though in a real environment this might be driven by a cron or actual clock.
            # Using small sleeps to keep demo fast but observable.
            await asyncio.sleep(event["time_offset_seconds"])
            
            # Create a synthetic mutation to broadcast the event
            await self.enterprise_engine.apply_mutation(
                target_id="SYSTEM",
                mutation_payload={"event_name": event["event"], "severity": event["severity"]},
                source="ScenarioEngine-Timeline"
            )
            
        print("Scenario timeline completed.")

    def get_agent_objectives(self):
        if not self.active_scenario:
            return []
        return [obj.dict() for obj in self.active_scenario.agent_objectives]
