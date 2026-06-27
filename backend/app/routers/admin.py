from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..services.synthetic_generator import generate_synthetic_enterprise

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.post("/regenerate-enterprise")
async def regenerate_enterprise(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    background_tasks.add_task(generate_synthetic_enterprise, db)
    return {"status": "Enterprise regeneration started in background."}
