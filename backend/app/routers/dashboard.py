from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Dict, Any
from ..database import get_db
from ..models import Risk, Event, EnterpriseMetric, ExecutionAction, ScenarioState

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/overview")
async def get_overview(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EnterpriseMetric).order_by(EnterpriseMetric.timestamp.desc()).limit(1))
    metric = result.scalars().first()
    
    if not metric:
        return {"status": "Offline", "metrics": {}}

    return {
        "status": "Enterprise Operational",
        "metrics": {
            "health_score": metric.health_score,
            "risk_exposure": metric.risk_exposure,
            "critical_risks": metric.critical_risks,
            "projected_savings": metric.projected_savings,
            "recovery_success_rate": metric.recovery_success_rate
        }
    }

@router.get("/health-history")
async def get_health_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EnterpriseMetric).order_by(EnterpriseMetric.timestamp.asc()).limit(30))
    metrics = result.scalars().all()
    return [{"name": m.timestamp.strftime("%Y-%m-%d"), "score": m.health_score} for m in metrics]

@router.get("/radar")
async def get_radar(db: AsyncSession = Depends(get_db)):
    # Group risks by their description field which holds category in our schema
    result = await db.execute(select(Risk.description, func.sum(Risk.financial_exposure)).group_by(Risk.description))
    data = result.all()
    # Ensure standard categories exist even if 0
    categories = {"Finance": 0, "Operations": 0, "Compliance": 0, "Security": 0, "Supply Chain": 0, "Reputation": 0}
    for row in data:
        cat = row[0]
        val = row[1]
        if cat in categories:
            categories[cat] += val
        else:
            categories[cat] = val
    
    # Return formatted for radar chart
    return [{"subject": k, "A": v * 10} for k, v in categories.items()]

@router.get("/live-events")
async def get_live_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).order_by(Event.timestamp.desc()).limit(20))
    events = result.scalars().all()
    return [
        {
            "id": e.id,
            "title": e.title,
            "severity": e.severity.value,
            "source": e.source,
            "timestamp": e.timestamp.isoformat()
        } for e in events
    ]

@router.get("/top-risks")
async def get_top_risks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Risk).order_by(desc(Risk.probability * Risk.financial_exposure)).limit(5))
    risks = result.scalars().all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "exposure": r.financial_exposure,
            "probability": r.probability,
            "severity": r.severity.value
        } for r in risks
    ]

@router.get("/system-status")
async def get_system_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExecutionAction).order_by(ExecutionAction.id.asc()).limit(10))
    actions = result.scalars().all()
    return [
        {
            "id": a.id,
            "connector_type": a.connector_type,
            "action_type": a.action_type,
            "status": a.status
        } for a in actions
    ]

@router.get("/executive-summary")
async def get_executive_summary(db: AsyncSession = Depends(get_db)):
    # Pull current active scenario state
    result = await db.execute(select(ScenarioState).where(ScenarioState.state == "IN_PROGRESS").limit(1))
    scenario = result.scalars().first()
    
    if scenario:
        return {
            "briefing": f"Enterprise health under pressure due to {scenario.name}. Execution graph is {scenario.progress}% complete with projected financial impact of ${scenario.impact_metrics.get('cost', 0):,}.",
            "timeline": scenario.timeline
        }
    return {
        "briefing": "Enterprise health remains stable. No critical scenarios active. All defensive postures operating within normal parameters.",
        "timeline": []
    }
