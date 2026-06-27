from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..services.ai.ollama import OllamaProvider

router = APIRouter(prefix="/api/boardroom", tags=["Boardroom Executive Mode"])

@router.get("/summary")
async def get_board_summary(db: AsyncSession = Depends(get_db)):
    from ..models import EnterpriseMetric, ConsensusResult
    metric_res = await db.execute(select(EnterpriseMetric).order_by(EnterpriseMetric.timestamp.desc()).limit(1))
    metric = metric_res.scalars().first()
    
    consensus_res = await db.execute(select(ConsensusResult).order_by(ConsensusResult.timestamp.desc()).limit(1))
    consensus = consensus_res.scalars().first()
    
    provider = OllamaProvider()
    exec_summary = await provider.generate_text(
        "Generate a 3-sentence executive summary based on the current platform state: Risk is high, but UiPath failover execution plan is ready with 92% execution readiness score.",
        "You are the Executive Reporting AI. Output clear, concise business language."
    )
    
    return {
        "metrics": metric,
        "readiness": consensus,
        "ai_executive_summary": exec_summary,
        "projected_savings": f"${metric.projected_savings}M" if metric else "$0.0M",
        "risk_exposure": "CRITICAL" if metric and metric.risk_exposure > 20 else "HIGH"
    }
