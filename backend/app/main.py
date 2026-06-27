from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

from .database import engine, Base, init_db
from .routers import dashboard, admin, scenarios, demo, twin, futures, agents, execution, boardroom
from .redis import redis_client
from .neo4j_db import close_neo4j
from .services.event_engine import EventEngine
from .services.propagation_engine import PropagationEngine

app = FastAPI(title="KAIZEN-X API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(scenarios.router)
app.include_router(demo.router)
app.include_router(twin.router)
app.include_router(futures.router)
app.include_router(agents.router)
app.include_router(execution.router)
app.include_router(boardroom.router)

active_websockets = []

@app.on_event("startup")
async def startup():
    await init_db()
    
    # Run Bootstrap Service
    from .database import AsyncSessionLocal
    from .services.bootstrap.BootstrapService import BootstrapService
    async with AsyncSessionLocal() as db:
        bootstrapper = BootstrapService(db)
        await bootstrapper.run_if_empty()
    
    # Start the background event engine
    app.state.event_engine = EventEngine()
    asyncio.create_task(app.state.event_engine.start())
    
    # Start redis listener for websockets
    asyncio.create_task(redis_listener())

@app.on_event("shutdown")
async def shutdown():
    await app.state.event_engine.stop()
    await redis_client.close()
    await close_neo4j()

async def redis_listener():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("enterprise_events")
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                event_data = message["data"]
                # Broadcast to all connected clients
                disconnected = []
                for ws in active_websockets:
                    try:
                        await ws.send_text(event_data)
                    except Exception:
                        disconnected.append(ws)
                for ws in disconnected:
                    active_websockets.remove(ws)
    except Exception as e:
        print(f"Redis listener error: {e}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            # Just keep the connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        active_websockets.remove(websocket)
