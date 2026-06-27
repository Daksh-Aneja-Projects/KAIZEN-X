from fastapi import APIRouter, Request, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import Severity, TwinNode
from ..database import get_db
from ..services.propagation_engine import PropagationEngine

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])

@router.post("/vendor-bankruptcy")
async def vendor_bankruptcy(request: Request, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    event_engine = request.app.state.event_engine
    await event_engine.generate_event(force_severity=Severity.CRITICAL, force_title="Vendor Alpha Bankruptcy Filed")
    
    # Trigger propagation
    engine = PropagationEngine(db)
    # Find a vendor to start from
    res = await db.execute(select(TwinNode).where(TwinNode.type == "VENDOR").limit(1))
    vendor = res.scalars().first()
    if vendor:
        background_tasks.add_task(engine.propagate_failure, vendor.id, "CRITICAL")
    
    return {"status": "Scenario injected: Vendor Bankruptcy"}

@router.post("/supply-chain-disruption")
async def supply_chain_disruption(request: Request, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    event_engine = request.app.state.event_engine
    await event_engine.generate_event(force_severity=Severity.HIGH, force_title="Supply Chain Disruption Detected in Region 4")
    
    engine = PropagationEngine(db)
    res = await db.execute(select(TwinNode).where(TwinNode.type == "PROJECT").limit(1))
    project = res.scalars().first()
    if project:
        background_tasks.add_task(engine.propagate_failure, project.id, "HIGH")

    return {"status": "Scenario injected: Supply Chain Disruption"}

@router.post("/project-delay")
async def project_delay(request: Request, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    event_engine = request.app.state.event_engine
    await event_engine.generate_event(force_severity=Severity.MEDIUM, force_title="Project Phoenix Delayed by 6 Months")
    
    engine = PropagationEngine(db)
    res = await db.execute(select(TwinNode).where(TwinNode.type == "PROJECT").offset(1).limit(1))
    project = res.scalars().first()
    if project:
        background_tasks.add_task(engine.propagate_failure, project.id, "MEDIUM")

    return {"status": "Scenario injected: Project Delay"}
