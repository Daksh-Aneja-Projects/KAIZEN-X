from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..services.execution.action_orchestrator import ActionOrchestrator
from ..models import ExecutionPlan, ExecutionAction, ApprovalRequest

router = APIRouter(prefix="/api/execution", tags=["Execution Layer"])

@router.post("/plan")
async def create_plan(scenario_id: str, recovery_path_id: str, db: AsyncSession = Depends(get_db)):
    orc = ActionOrchestrator(db)
    plan = await orc.generate_plan(scenario_id, recovery_path_id)
    return {"status": "Plan Generated", "plan_id": plan.id}

@router.get("/status")
async def get_status(db: AsyncSession = Depends(get_db)):
    # Returns latest plan and actions for the Recovery Center UI
    res = await db.execute(select(ExecutionPlan).order_by(ExecutionPlan.timestamp.desc()).limit(1))
    plan = res.scalars().first()
    if not plan:
        return {"plan": None}
        
    actions_res = await db.execute(select(ExecutionAction).where(ExecutionAction.plan_id == plan.id).order_by(ExecutionAction.execution_order))
    actions = actions_res.scalars().all()
    
    approvals_res = await db.execute(select(ApprovalRequest).where(ApprovalRequest.status == "PENDING"))
    approvals = approvals_res.scalars().all()
    
    return {
        "plan": plan,
        "actions": actions,
        "pending_approvals": approvals
    }

@router.post("/approve/{request_id}")
async def approve_action(request_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ApprovalRequest).where(ApprovalRequest.id == request_id))
    app_req = res.scalars().first()
    if app_req:
        app_req.status = "APPROVED"
        await db.commit()
    return {"status": "Approved"}

@router.post("/reject/{request_id}")
async def reject_action(request_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ApprovalRequest).where(ApprovalRequest.id == request_id))
    app_req = res.scalars().first()
    if app_req:
        app_req.status = "REJECTED"
        await db.commit()
    return {"status": "Rejected"}
