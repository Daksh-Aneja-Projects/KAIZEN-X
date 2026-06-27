from sqlalchemy.ext.asyncio import AsyncSession
from .base_agent import BaseAgent

class RiskAgent(BaseAgent):
    def __init__(self, db: AsyncSession):
        super().__init__(db, "Risk Agent", "Analyze graph risks, propagation vectors, and generate risk scores.")

class FinanceAgent(BaseAgent):
    def __init__(self, db: AsyncSession):
        super().__init__(db, "Finance Agent", "Estimate financial impact, recovery costs, ROI, and budget exposure.")

class ComplianceAgent(BaseAgent):
    def __init__(self, db: AsyncSession):
        super().__init__(db, "Compliance Agent", "Analyze regulatory impact, policy violations, and identify compliance risks.")

class OperationsAgent(BaseAgent):
    def __init__(self, db: AsyncSession):
        super().__init__(db, "Operations Agent", "Analyze operational disruption, estimate downtime, and recovery timelines.")

class StrategyAgent(BaseAgent):
    def __init__(self, db: AsyncSession):
        super().__init__(db, "Strategy Agent", "Compare future families and recovery paths, generating strategic options.")

class ExecutiveAgent(BaseAgent):
    def __init__(self, db: AsyncSession):
        super().__init__(db, "Executive Agent", "Aggregate all agent findings to produce board-level insights and final recommendations.")
