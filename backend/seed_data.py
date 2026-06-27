import asyncio
import uuid
import random
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from faker import Faker
from app.models import Base, TwinNode, TwinEdge, TwinNodeType, TwinEdgeType

# Connect to DB outside of docker for local execution
DATABASE_URL = "postgresql+asyncpg://kaizen:password@localhost:5432/kaizen_db"
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
fake = Faker()

async def seed_data():
    async with AsyncSessionLocal() as db:
        # Clear existing
        print("Clearing existing twin data...")
        await db.execute(TwinEdge.__table__.delete())
        await db.execute(TwinNode.__table__.delete())
        
        nodes = []
        
        # 50 Departments
        print("Generating 50 Departments...")
        depts = []
        for _ in range(50):
            node = TwinNode(id=str(uuid.uuid4()), label=f"{fake.job()} Department", type=TwinNodeType.DEPARTMENT, health_score=random.uniform(70, 100))
            nodes.append(node)
            depts.append(node)

        # 100 Vendors
        print("Generating 100 Vendors...")
        vendors = []
        for _ in range(100):
            node = TwinNode(id=str(uuid.uuid4()), label=fake.company(), type=TwinNodeType.VENDOR, health_score=random.uniform(50, 100))
            nodes.append(node)
            vendors.append(node)

        # 500 Projects
        print("Generating 500 Projects...")
        projects = []
        for _ in range(500):
            node = TwinNode(id=str(uuid.uuid4()), label=f"Project {fake.catch_phrase()}", type=TwinNodeType.PROJECT, health_score=random.uniform(60, 100))
            nodes.append(node)
            projects.append(node)

        # 1000 Risks
        print("Generating 1000 Risks...")
        risks = []
        for _ in range(1000):
            node = TwinNode(id=str(uuid.uuid4()), label=f"Risk: {fake.bs()}", type=TwinNodeType.RISK, health_score=random.uniform(20, 100))
            nodes.append(node)
            risks.append(node)

        # 10000 Employees (Batch insert)
        print("Generating 10,000 Employees...")
        employees = []
        for _ in range(10000):
            node = TwinNode(id=str(uuid.uuid4()), label=fake.name(), type=TwinNodeType.EMPLOYEE, health_score=random.uniform(80, 100))
            nodes.append(node)
            employees.append(node)

        print("Flushing nodes...")
        # Since it's large, we might need to batch add
        for i in range(0, len(nodes), 2000):
            db.add_all(nodes[i:i+2000])
            await db.commit()

        # Connect them up
        edges = []
        print("Connecting Edges...")
        # Employees to Departments
        for emp in employees:
            dept = random.choice(depts)
            edges.append(TwinEdge(id=str(uuid.uuid4()), source_id=emp.id, target_id=dept.id, type=TwinEdgeType.REPORTS_TO, weight=1.0))

        # Projects to Departments
        for proj in projects:
            dept = random.choice(depts)
            edges.append(TwinEdge(id=str(uuid.uuid4()), source_id=proj.id, target_id=dept.id, type=TwinEdgeType.OWNS, weight=random.uniform(0.5, 1.0)))

        # Vendors to Projects
        for proj in projects:
            if random.random() > 0.5:
                vendor = random.choice(vendors)
                edges.append(TwinEdge(id=str(uuid.uuid4()), source_id=vendor.id, target_id=proj.id, type=TwinEdgeType.SUPPLIES, weight=random.uniform(0.5, 1.0)))

        # Risks to Projects/Departments
        for risk in risks:
            if random.random() > 0.5:
                target = random.choice(projects)
                edges.append(TwinEdge(id=str(uuid.uuid4()), source_id=risk.id, target_id=target.id, type=TwinEdgeType.IMPACTS, weight=random.uniform(0.1, 0.9)))
            else:
                target = random.choice(depts)
                edges.append(TwinEdge(id=str(uuid.uuid4()), source_id=risk.id, target_id=target.id, type=TwinEdgeType.IMPACTS, weight=random.uniform(0.1, 0.9)))

        print("Flushing edges...")
        for i in range(0, len(edges), 2000):
            db.add_all(edges[i:i+2000])
            await db.commit()
            
        print("Seed Complete.")

if __name__ == "__main__":
    asyncio.run(seed_data())
