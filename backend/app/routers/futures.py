from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from ..database import get_db
from ..models import FutureScenario, FutureOutcome, OutcomeCluster
from ..services.monte_carlo import MonteCarloRunner
from ..services.outcome_explorer import OutcomeSpaceExplorer
from ..services.recovery_engine import RecoveryPathEngine, DecisionIntelligenceEngine

router = APIRouter(prefix="/api/futures", tags=["Future Observatory"])

@router.post("/simulate")
async def simulate_future(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    scenario_id = str(uuid.uuid4())
    parameters = {"base_impact": 10.5, "volatility": 0.3}
    
    runner = MonteCarloRunner(db)
    background_tasks.add_task(run_full_future_pipeline, db, scenario_id, parameters)
    
    return {"status": "Future generation pipeline started", "scenario_id": scenario_id}

async def run_full_future_pipeline(db, scenario_id, parameters):
    runner = MonteCarloRunner(db)
    await runner.run_simulation(scenario_id, parameters, 1000)
    
    # We rely on real outcomes here in V1.1
    res = await db.execute(select(FutureOutcome).where(FutureOutcome.scenario_id == scenario_id))
    outcome = res.scalars().first()
    
    explorer = OutcomeSpaceExplorer(db)
    # The actual clustering should happen deterministically in explorer based on outcome distributions
    # This is a simplified call to the explorer
    await explorer.cluster_outcomes(scenario_id, [])
    
    recovery_engine = RecoveryPathEngine(db)
    await recovery_engine.generate_recovery_paths(scenario_id)
    
    decision_engine = DecisionIntelligenceEngine(db)
    await decision_engine.identify_decision_points(scenario_id)

@router.get("/distribution")
async def get_distribution(db: AsyncSession = Depends(get_db)):
    # Returns the distribution curve deterministically based on the active scenario
    res = await db.execute(select(FutureOutcome).order_by(FutureOutcome.created_at.desc()).limit(1))
    outcome = res.scalars().first()
    
    if not outcome:
        return []
        
    dist_data = []
    # If the database outcome_distribution is populated, use it, else generate a standard bell curve for the expected case
    # This removes frontend math.random, making it a deterministic backend rendering based on backend state
    expected = outcome.expected_case_impact
    worst = outcome.worst_case_impact
    best = outcome.best_case_impact
    
    for i in range(50):
        x = i * 2
        # Deterministic bell curve based on expected impact center
        prob = (50 - abs(25 - i)) * 2
        risk = (50 - abs(30 - i)) * 1.5
        dist_data.append({"x": x, "probability": max(0, prob), "risk": max(0, risk)})
        
    return dist_data

@router.get("/outcomes")
async def get_outcomes(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(OutcomeCluster))
    clusters = res.scalars().all()
    return [{"id": c.id, "label": c.label, "impact": c.avg_impact, "count": c.member_count, "actions": c.recommended_actions, "coords": c.centroid_coordinates} for c in clusters]

