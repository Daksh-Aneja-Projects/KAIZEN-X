import json
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ...models import (
    TwinNode, TwinEdge, Risk, Event, EnterpriseMetric, 
    FutureScenario, FutureOutcome, OutcomeCluster,
    ScenarioState, ExecutionAction, Severity, TwinNodeType, TwinEdgeType,
    EventLedger
)

class BootstrapService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def run_if_empty(self):
        """Checks if enterprise metrics exist. If not, boots up the full data layer."""
        result = await self.db.execute(select(func.count(EnterpriseMetric.id)))
        count = result.scalar()
        if count == 0:
            print("🚀 [BootstrapService] Empty database detected. Initiating Enterprise Data Layer seed...")
            await self.seed_historical_metrics()
            await self.seed_enterprise_graph()
            await self.seed_risks()
            await self.seed_events()
            await self.seed_scenarios()
            await self.seed_future_outcomes()
            await self.seed_connected_systems()
            await self.seed_agent_swarm()
            await self.seed_execution_plans()
            await self.db.commit()
            print("✅ [BootstrapService] Seeding complete.")
        else:
            print(f"✅ [BootstrapService] Database already populated ({count} metrics found).")

    async def seed_historical_metrics(self):
        # 30 days of history
        base_time = datetime.utcnow() - timedelta(days=30)
        score = 92.0
        for i in range(30):
            score += random.uniform(-2, 2.5)
            if score > 100: score = 100
            if score < 50: score = 50
            metric = EnterpriseMetric(
                timestamp=base_time + timedelta(days=i),
                health_score=round(score, 1),
                risk_exposure=random.randint(5, 25),
                critical_risks=random.randint(1, 5),
                projected_savings=round(random.uniform(2.0, 15.0), 1),
                recovery_success_rate=round(random.uniform(85.0, 99.0), 1)
            )
            self.db.add(metric)

    async def seed_enterprise_graph(self):
        # We assume Neo4j handles its own sync, but we seed PostgreSQL relational twin nodes
        nodes = [
            TwinNode(id="VEN-ALPHA", label="Vendor Alpha", type=TwinNodeType.VENDOR, status="Warning", health_score=65.0),
            TwinNode(id="VEN-BETA", label="Vendor Beta", type=TwinNodeType.VENDOR, status="Healthy", health_score=98.0),
            TwinNode(id="SYS-ERP", label="SAP ERP Core", type=TwinNodeType.SYSTEM, status="Healthy", health_score=95.0),
            TwinNode(id="PROJ-PHOENIX", label="Project Phoenix", type=TwinNodeType.PROJECT, status="Critical", health_score=45.0)
        ]
        self.db.add_all(nodes)
        await self.db.flush()

        edges = [
            TwinEdge(id="EDGE-1", source_id="VEN-ALPHA", target_id="SYS-ERP", type=TwinEdgeType.SUPPLIES, weight=1.0),
            TwinEdge(id="EDGE-2", source_id="VEN-BETA", target_id="SYS-ERP", type=TwinEdgeType.SUPPLIES, weight=1.0),
            TwinEdge(id="EDGE-3", source_id="SYS-ERP", target_id="PROJ-PHOENIX", type=TwinEdgeType.SUPPORTS, weight=1.0)
        ]
        self.db.add_all(edges)

    async def seed_risks(self):
        risks = [
            Risk(id="RSK-101", title="Vendor Alpha Bankruptcy", description="Finance", severity=Severity.CRITICAL, status="Active", financial_exposure=15.5, probability=0.82),
            Risk(id="RSK-102", title="Datacenter B Outage", description="Operations", severity=Severity.HIGH, status="Monitoring", financial_exposure=8.2, probability=0.35),
            Risk(id="RSK-103", title="EU GDPR Compliance Gap", description="Compliance", severity=Severity.MEDIUM, status="Active", financial_exposure=2.1, probability=0.60)
        ]
        self.db.add_all(risks)

    async def seed_events(self):
        events = [
            Event(id="EVT-001", title="Supply Chain Alert", description="Supplier missed SLA.", severity=Severity.HIGH, source="ERP", impact_score=40.0),
            Event(id="EVT-002", title="Database Latency Spike", description="Latency > 500ms.", severity=Severity.MEDIUM, source="AWS CloudWatch", impact_score=20.0),
            Event(id="EVT-003", title="Compliance Audit Failure", description="Missing SOC2 doc.", severity=Severity.CRITICAL, source="Audit Tool", impact_score=85.0)
        ]
        self.db.add_all(events)
        await self.db.flush()
        
        import uuid
        base_time = datetime.utcnow() - timedelta(minutes=5)
        ledger = [
            EventLedger(id=str(uuid.uuid4()), timestamp=base_time, entity_type="Node", entity_id="VEN-ALPHA", event_type="Risk Propagated", payload={"risk": "Supplier Delay"}),
            EventLedger(id=str(uuid.uuid4()), timestamp=base_time + timedelta(seconds=10), entity_type="Node", entity_id="SYS-ERP", event_type="Throughput Dropped", payload={"value": "-15%"}),
            EventLedger(id=str(uuid.uuid4()), timestamp=base_time + timedelta(seconds=25), entity_type="Node", entity_id="PROJ-PHOENIX", event_type="Timeline Delayed", payload={"days": 14})
        ]
        self.db.add_all(ledger)

    async def seed_scenarios(self):
        fs = FutureScenario(
            id="SCN-CURRENT",
            name="Vendor Alpha Insolvency - Base Scenario",
            description="The live scenario tracked by the Enterprise State Engine.",
            parameters={},
            created_at=datetime.utcnow()
        )
        self.db.add(fs)

        scenario = ScenarioState(
            id="SCN-CURRENT",
            name="Vendor Alpha Insolvency",
            state="IN_PROGRESS",
            progress=35.0,
            timeline=[
                {"time": "08:00", "title": "Anomaly Detected", "status": "completed"},
                {"time": "08:15", "title": "Swarm Initialized", "status": "completed"},
                {"time": "08:45", "title": "Impact Graph Built", "status": "completed"},
                {"time": "09:30", "title": "Executive Briefing", "status": "pending"}
            ],
            impact_metrics={"cost": 1250000, "delay": 14}
        )
        self.db.add(scenario)
        await self.db.flush()

    async def seed_future_outcomes(self):
        scenario = FutureScenario(id="FUT-01", name="Vendor Collapse Forecast", description="10k Simulations", parameters={})
        self.db.add(scenario)
        await self.db.flush()
        
        outcome = FutureOutcome(
            id="FO-01",
            scenario_id="FUT-01",
            expected_case_impact=-2.4,
            worst_case_impact=-18.2,
            best_case_impact=12.5,
            confidence=0.92,
            outcome_distribution={}
        )
        self.db.add(outcome)
        
        clusters = [
            OutcomeCluster(id="CLU-1", scenario_id="FUT-01", label="Winning Futures", centroid_coordinates={"cost": 5, "risk": 20}, member_count=1500, avg_impact=12.5, recommended_actions=["Accelerate Contract Beta"]),
            OutcomeCluster(id="CLU-2", scenario_id="FUT-01", label="Acceptable Futures", centroid_coordinates={"cost": -2, "risk": 40}, member_count=7000, avg_impact=-2.4, recommended_actions=["Shift load to Supplier B"]),
            OutcomeCluster(id="CLU-3", scenario_id="FUT-01", label="Failing Futures", centroid_coordinates={"cost": -10, "risk": 70}, member_count=1000, avg_impact=-8.0, recommended_actions=["Alert Board"]),
            OutcomeCluster(id="CLU-4", scenario_id="FUT-01", label="Catastrophic Futures", centroid_coordinates={"cost": -18, "risk": 90}, member_count=500, avg_impact=-18.2, recommended_actions=["Trigger Emergency Stop"])
        ]
        self.db.add_all(clusters)

    async def seed_connected_systems(self):
        actions = [
            ExecutionAction(id="ACT-1", connector_type="UiPath", action_type="Vendor Lock", status="COMPLETED", execution_order=1),
            ExecutionAction(id="ACT-2", connector_type="ServiceNow", action_type="Create Incident", status="COMPLETED", execution_order=2),
            ExecutionAction(id="ACT-3", connector_type="Slack", action_type="Notify Exec Team", status="IN_PROGRESS", execution_order=3),
            ExecutionAction(id="ACT-4", connector_type="SAP", action_type="Route Orders", status="PENDING", execution_order=4)
        ]
        self.db.add_all(actions)

    async def seed_agent_swarm(self):
        from ...models import AgentInteraction, AgentRecommendation, ConsensusResult
        interactions = [
            AgentInteraction(id="INT-1", scenario_id="SCN-CURRENT", agent_name="Risk Agent", prompt="Analyze Vendor Alpha risk exposure.", reasoning={"output": "Vendor Alpha risk exposure identified at $15.5M.", "role": "analyst", "tokens_used": 125, "inference_time_ms": 850}, timestamp=datetime.utcnow() - timedelta(minutes=45)),
            AgentInteraction(id="INT-2", scenario_id="SCN-CURRENT", agent_name="Finance Agent", prompt="Evaluate financial impact of Vendor Beta.", reasoning={"output": "Impact reduces to $2.4M if we switch to Vendor Beta within 14 days.", "role": "analyst", "tokens_used": 312, "inference_time_ms": 1120}, timestamp=datetime.utcnow() - timedelta(minutes=40)),
            AgentInteraction(id="INT-3", scenario_id="SCN-CURRENT", agent_name="Ops Agent", prompt="Determine operational viability of switch.", reasoning={"output": "Switching routing requires SAP reconfiguration. Executing dry run.", "role": "analyst", "tokens_used": 198, "inference_time_ms": 900}, timestamp=datetime.utcnow() - timedelta(minutes=35))
        ]
        self.db.add_all(interactions)

        recs = [
            AgentRecommendation(id="REC-1", scenario_id="SCN-CURRENT", agent_name="Finance Agent", recommendation="Trigger contract clause 4.2 with Vendor Beta. Minimizes cost impact.", confidence=0.88, complexity=0.3, expected_benefit=1.2, dependencies=[], timestamp=datetime.utcnow() - timedelta(minutes=30)),
            AgentRecommendation(id="REC-2", scenario_id="SCN-CURRENT", agent_name="Executive Agent", recommendation="Initiate Enterprise Failover to Vendor Beta. Consensus reached across all domains. Risk > Threshold.", confidence=0.92, complexity=0.7, expected_benefit=2.4, dependencies=[], timestamp=datetime.utcnow() - timedelta(minutes=15))
        ]
        self.db.add_all(recs)

        consensus = ConsensusResult(
            id="CON-1", scenario_id="SCN-CURRENT", final_recommendation="Execute Failover to Vendor Beta",
            execution_readiness_score=92.0, agreement_score=0.9, conflict_score=0.1, executive_confidence=0.88, timestamp=datetime.utcnow() - timedelta(minutes=10)
        )
        self.db.add(consensus)

    async def seed_execution_plans(self):
        from ...models import ExecutionPlan, ApprovalRequest, RecoveryPath
        path1 = RecoveryPath(
            id="PATH-1", 
            scenario_id="SCN-CURRENT", 
            steps=[{"step": "Isolate Vendor Alpha nodes in network"}, {"step": "Failover to Vendor Beta"}, {"step": "Validate ERP transaction flow"}], 
            success_probability=0.92, 
            estimated_duration_days=2
        )
        path2 = RecoveryPath(
            id="PATH-2", 
            scenario_id="SCN-CURRENT", 
            steps=[{"step": "Run phased hybrid processing"}, {"step": "Analyze load on Vendor Beta"}, {"step": "Complete cutover in 2 weeks"}], 
            success_probability=0.45, 
            estimated_duration_days=14
        )
        self.db.add_all([path1, path2])
        await self.db.flush()

        plan = ExecutionPlan(id="PLAN-1", scenario_id="SCN-CURRENT", recovery_path_id="PATH-1", status="PENDING", timestamp=datetime.utcnow())
        self.db.add(plan)
        
        # Link earlier actions to this plan
        res = await self.db.execute(select(ExecutionAction))
        actions = res.scalars().all()
        for a in actions:
            a.plan_id = "PLAN-1"
        
        approval = ApprovalRequest(id="APP-1", action_id="ACT-4", status="PENDING", requested_at=datetime.utcnow())
        self.db.add(approval)
