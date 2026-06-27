import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from ...models import ConsensusResult
import numpy as np

class ConsensusEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def calculate_consensus(self, scenario_id: str, recommendations: list, exec_rec: dict):
        """
        Calculates consensus matrices based on agent outputs.
        """
        confidences = [r["confidence"] for r in recommendations]
        complexities = [r["complexity"] for r in recommendations]
        benefits = [r["expected_benefit"] for r in recommendations]
        
        # Agreement score proxy: inverted standard deviation of benefits
        std_dev = np.std(benefits) if len(benefits) > 1 else 0
        agreement_score = max(0.0, 1.0 - (std_dev * 2))
        
        # Conflict proxy
        conflict_score = 1.0 - agreement_score
        
        # Readiness score formula
        avg_confidence = np.mean(confidences)
        avg_complexity = np.mean(complexities)
        avg_benefit = np.mean(benefits)
        
        readiness_score = (avg_benefit * 0.5) + (avg_confidence * 0.3) + ((1.0 - avg_complexity) * 0.2)
        
        cr = ConsensusResult(
            id=str(uuid.uuid4()),
            scenario_id=scenario_id,
            agreement_score=agreement_score,
            conflict_score=conflict_score,
            executive_confidence=exec_rec.get("confidence", 0.8),
            execution_readiness_score=readiness_score,
            final_recommendation=exec_rec.get("recommendation", "Awaiting execution")
        )
        self.db.add(cr)
        await self.db.commit()
        return cr
