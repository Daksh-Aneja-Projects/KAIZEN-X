import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from .specialized_agents import RiskAgent, FinanceAgent, ComplianceAgent, OperationsAgent, StrategyAgent, ExecutiveAgent
from .consensus_engine import ConsensusEngine
from ...models import AgentInteraction, AgentRecommendation
import asyncio

class AgentOrchestrator:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.risk = RiskAgent(db)
        self.finance = FinanceAgent(db)
        self.compliance = ComplianceAgent(db)
        self.ops = OperationsAgent(db)
        self.strategy = StrategyAgent(db)
        self.exec = ExecutiveAgent(db)
        self.consensus = ConsensusEngine(db)

    async def run_war_room(self, scenario_id: str, scenario_data: dict):
        # Step 1: Parallel specialized agents
        agents = [self.risk, self.finance, self.compliance, self.ops, self.strategy]
        tasks = [agent.analyze(scenario_data) for agent in agents]
        results = await asyncio.gather(*tasks)
        
        recs = []
        for i, agent in enumerate(agents):
            res = results[i]
            
            # Persist interaction
            interaction = AgentInteraction(
                id=str(uuid.uuid4()),
                scenario_id=scenario_id,
                agent_name=agent.name,
                prompt=str(scenario_data),
                reasoning=res.get("reasoning", [])
            )
            self.db.add(interaction)
            
            # Persist recommendation
            rec = AgentRecommendation(
                id=str(uuid.uuid4()),
                scenario_id=scenario_id,
                agent_name=agent.name,
                recommendation=res.get("recommendation", ""),
                confidence=res.get("confidence", 0.5),
                complexity=res.get("complexity", 0.5),
                expected_benefit=res.get("expected_benefit", 0.5),
                dependencies=res.get("dependencies", [])
            )
            self.db.add(rec)
            recs.append(res)
            
        await self.db.commit()
        
        # Step 2: Executive Agent aggregates
        exec_payload = {"scenario": scenario_data, "sub_agent_recommendations": recs}
        exec_res = await self.exec.analyze(exec_payload)
        
        # Persist Exec
        exec_rec = AgentRecommendation(
            id=str(uuid.uuid4()),
            scenario_id=scenario_id,
            agent_name=self.exec.name,
            recommendation=exec_res.get("recommendation", ""),
            confidence=exec_res.get("confidence", 0.9),
            complexity=exec_res.get("complexity", 0.5),
            expected_benefit=exec_res.get("expected_benefit", 0.9),
            dependencies=exec_res.get("dependencies", [])
        )
        self.db.add(exec_rec)
        await self.db.commit()
        
        # Step 3: Consensus Engine
        cr = await self.consensus.calculate_consensus(scenario_id, recs, exec_res)
        
        return {
            "status": "War Room Complete",
            "consensus": cr.id
        }
