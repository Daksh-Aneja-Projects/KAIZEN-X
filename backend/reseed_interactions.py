import asyncio
from app.database import AsyncSessionLocal
from app.services.bootstrap.BootstrapService import BootstrapService
from sqlalchemy import text

async def main():
    async with AsyncSessionLocal() as session:
        # Delete existing data
        await session.execute(text("DELETE FROM agent_interactions"))
        await session.execute(text("DELETE FROM agent_recommendations"))
        await session.execute(text("DELETE FROM consensus_results"))
        await session.commit()
        
        print("Cleared agent tables. Reseeding...")
        bs = BootstrapService(session)
        await bs.seed_agent_swarm()
        await session.commit()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
