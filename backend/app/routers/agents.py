from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..services.agents.orchestrator import AgentOrchestrator
import uuid

router = APIRouter(prefix="/api/agents", tags=["Agents"])

@router.post("/analyze")
async def start_war_room(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    scenario_id = str(uuid.uuid4())
    scenario_data = {"event": "Supply Chain Cascade", "severity": "CRITICAL", "impact_estimate": 15000000}
    
    # Run in background
    background_tasks.add_task(run_orchestrator, db, scenario_id, scenario_data)
    
    return {"status": "War room analysis initiated", "scenario_id": scenario_id}

async def run_orchestrator(db, scenario_id, scenario_data):
    orc = AgentOrchestrator(db)
    await orc.run_war_room(scenario_id, scenario_data)

@router.get("/recommendations")
async def get_recommendations(db: AsyncSession = Depends(get_db)):
    from ..models import AgentRecommendation
    res = await db.execute(select(AgentRecommendation).order_by(AgentRecommendation.timestamp.desc()).limit(20))
    return res.scalars().all()

@router.get("/consensus")
async def get_consensus(db: AsyncSession = Depends(get_db)):
    from ..models import ConsensusResult
    res = await db.execute(select(ConsensusResult).order_by(ConsensusResult.timestamp.desc()).limit(1))
    return res.scalars().first()

@router.get("/war-room")
async def get_war_room(db: AsyncSession = Depends(get_db)):
    from ..models import AgentInteraction, AgentRecommendation, ConsensusResult
    interactions = await db.execute(select(AgentInteraction).order_by(AgentInteraction.timestamp.desc()).limit(20))
    recommendations = await db.execute(select(AgentRecommendation).order_by(AgentRecommendation.timestamp.desc()).limit(20))
    consensus = await db.execute(select(ConsensusResult).order_by(ConsensusResult.timestamp.desc()).limit(1))
    
    return {
        "interactions": interactions.scalars().all(),
        "recommendations": recommendations.scalars().all(),
        "consensus": consensus.scalars().first()
    }

@router.get("/decision-studio")
async def get_decision_studio(db: AsyncSession = Depends(get_db)):
    from ..models import AgentRecommendation, ConsensusResult, RecoveryPath
    recs = await db.execute(select(AgentRecommendation).where(AgentRecommendation.agent_name == "Executive Agent").order_by(AgentRecommendation.timestamp.desc()).limit(5))
    consensus = await db.execute(select(ConsensusResult).order_by(ConsensusResult.timestamp.desc()).limit(1))
    paths = await db.execute(select(RecoveryPath).limit(10))
    
    return {
        "executive_recommendations": recs.scalars().all(),
        "readiness_metrics": consensus.scalars().first(),
        "recovery_paths": paths.scalars().all()
    }
