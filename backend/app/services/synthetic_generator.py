import asyncio
from faker import Faker
import random
import json
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Employee, Department, Vendor, Project, Risk, EnterpriseMetric
from ..models import TwinNode, TwinEdge, TwinNodeType, TwinEdgeType

fake = Faker()

async def generate_synthetic_enterprise(db: AsyncSession):
    # Generates ~500 nodes and ~1000 edges for the Digital Twin
    nodes = []
    edges = []

    def add_node(n_type, label, metadata=None):
        node = TwinNode(
            id=fake.uuid4(),
            label=label,
            type=n_type,
            status="Healthy",
            health_score=100.0,
            metadata_json=metadata or {}
        )
        nodes.append(node)
        return node

    def add_edge(source, target, e_type, weight=1.0):
        edge = TwinEdge(
            id=fake.uuid4(),
            source_id=source.id,
            target_id=target.id,
            type=e_type,
            weight=weight
        )
        edges.append(edge)
        return edge

    # 1. Departments (10)
    departments = [add_node(TwinNodeType.DEPARTMENT, fake.company_suffix() + " Dept") for _ in range(10)]
    
    # 2. Goals & Initiatives (20)
    goals = [add_node(TwinNodeType.GOAL, fake.bs().title()) for _ in range(5)]
    initiatives = [add_node(TwinNodeType.INITIATIVE, fake.catch_phrase()) for _ in range(15)]
    
    for init in initiatives:
        add_edge(init, random.choice(goals), TwinEdgeType.SUPPORTS)
        add_edge(random.choice(departments), init, TwinEdgeType.OWNS)

    # 3. Projects (50)
    projects = [add_node(TwinNodeType.PROJECT, "Project " + fake.word().capitalize()) for _ in range(50)]
    for proj in projects:
        add_edge(proj, random.choice(initiatives), TwinEdgeType.SUPPORTS)
        add_edge(random.choice(departments), proj, TwinEdgeType.OWNS)

    # 4. Vendors (30)
    vendors = [add_node(TwinNodeType.VENDOR, fake.company()) for _ in range(30)]
    for vendor in vendors:
        # vendors supply projects
        for _ in range(random.randint(1, 4)):
            add_edge(vendor, random.choice(projects), TwinEdgeType.SUPPLIES, weight=random.uniform(0.5, 1.5))

    # 5. Systems & Applications (100)
    systems = [add_node(TwinNodeType.SYSTEM, fake.domain_word().upper() + " Core") for _ in range(30)]
    applications = [add_node(TwinNodeType.APPLICATION, fake.domain_word() + " App") for _ in range(70)]
    
    for app in applications:
        add_edge(app, random.choice(systems), TwinEdgeType.DEPENDS_ON)
        # some applications support projects
        if random.random() > 0.5:
            add_edge(app, random.choice(projects), TwinEdgeType.SUPPORTS)
            
    # 6. Employees (250) - To hit ~500 nodes
    employees = [add_node(TwinNodeType.EMPLOYEE, fake.name()) for _ in range(250)]
    for emp in employees:
        add_edge(emp, random.choice(departments), TwinEdgeType.REPORTS_TO)
        if random.random() > 0.7:
            add_edge(emp, random.choice(projects), TwinEdgeType.SUPPORTS)

    # 7. Risks (20)
    risks = [add_node(TwinNodeType.RISK, fake.catch_phrase() + " Risk") for _ in range(20)]
    for risk in risks:
        # risk impacts projects or systems
        target_group = random.choice([projects, systems, vendors])
        for _ in range(random.randint(1, 3)):
            add_edge(risk, random.choice(target_group), TwinEdgeType.IMPACTS, weight=random.uniform(1.0, 3.0))

    # Add all to DB
    for n in nodes:
        db.add(n)
    for e in edges:
        db.add(e)

    metric = EnterpriseMetric(
        health_score=96.0,
        risk_exposure=14,
        critical_risks=3,
        projected_savings=8.2,
        recovery_success_rate=92.0
    )
    db.add(metric)

    await db.commit()
    print(f"Synthetic digital twin generated: {len(nodes)} nodes, {len(edges)} edges.")
