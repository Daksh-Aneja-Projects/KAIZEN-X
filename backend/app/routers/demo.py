from fastapi import APIRouter, Request, BackgroundTasks
import asyncio
from ..models import Severity

router = APIRouter(prefix="/api/demo", tags=["Demo"])

demo_running = False

async def run_demo_sequence(event_engine):
    global demo_running
    demo_running = True
    sequence = [
        (Severity.MEDIUM, "Unusual traffic detected in Datacenter Alpha", 2),
        (Severity.HIGH, "Database latency spike in Payment Gateway", 3),
        (Severity.CRITICAL, "Payment Gateway Offline", 1),
        (Severity.CRITICAL, "Enterprise SLA Breached", 5)
    ]
    
    for severity, title, delay in sequence:
        if not demo_running:
            break
        await asyncio.sleep(delay)
        await event_engine.generate_event(force_severity=severity, force_title=title)

@router.post("/start")
async def start_demo(request: Request, background_tasks: BackgroundTasks):
    global demo_running
    if not demo_running:
        event_engine = request.app.state.event_engine
        background_tasks.add_task(run_demo_sequence, event_engine)
    return {"status": "Demo sequence started"}

@router.post("/stop")
async def stop_demo():
    global demo_running
    demo_running = False
    return {"status": "Demo sequence stopped"}
