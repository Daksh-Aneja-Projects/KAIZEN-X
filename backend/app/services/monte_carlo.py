import random
import uuid
import json
import time
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import FutureOutcome, EventLedger
from .ai.observability import AIObservability

class MonteCarloRunner:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def run_simulation(self, scenario_id: str, parameters: dict, iterations: int = 1000):
        start_time = time.time()
        # Simulate financial exposure and outcome probabilities
        base_impact = parameters.get("base_impact", 5.0) # in millions
        volatility = parameters.get("volatility", 0.2)
        
        results = []
        for _ in range(iterations):
            # random walk / gaussian distribution
            impact = random.gauss(base_impact, base_impact * volatility)
            results.append(max(0, impact))
            
        results.sort()
        
        best_case = results[int(iterations * 0.05)]
        expected_case = sum(results) / iterations
        worst_case = results[int(iterations * 0.95)]
        
        outcome_id = str(uuid.uuid4())
        outcome = FutureOutcome(
            id=outcome_id,
            scenario_id=scenario_id,
            expected_case_impact=expected_case,
            worst_case_impact=worst_case,
            best_case_impact=best_case,
            confidence=0.92,
            outcome_distribution={"min": results[0], "max": results[-1], "iterations": iterations}
        )
        
        self.db.add(outcome)
        
        ledger_entry = EventLedger(
            id=str(uuid.uuid4()),
            entity_type="Simulation",
            entity_id=outcome_id,
            event_type="SimulationCompleted",
            payload={"scenario_id": scenario_id, "iterations": iterations, "expected": expected_case}
        )
        self.db.add(ledger_entry)
        
        await self.db.commit()
        
        latency = time.time() - start_time
        AIObservability.log_simulation(iterations, latency)
        
        return outcome
