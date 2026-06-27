from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class Dependency(BaseModel):
    target_id: str
    type: str  # e.g., "DEPENDS_ON", "SUPPLIES", "IMPACTS"
    weight: float = 1.0

class EnterpriseEntity(BaseModel):
    id: str
    name: str
    type: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[Dependency] = Field(default_factory=list)

class Department(EnterpriseEntity):
    type: str = "Department"
    headcount: int

class Vendor(EnterpriseEntity):
    type: str = "Vendor"
    risk_score: float

class Application(EnterpriseEntity):
    type: str = "Application"
    criticality: str

class Project(EnterpriseEntity):
    type: str = "Project"
    budget: float
    status: str

class EnterpriseKnowledgePack(BaseModel):
    version: str
    departments: List[Department]
    vendors: List[Vendor]
    applications: List[Application]
    projects: List[Project]

# Scenario Engine Schemas
class ScenarioTrigger(BaseModel):
    type: str
    target_id: str
    payload: Dict[str, Any]

class ExpectedKPI(BaseModel):
    metric: str
    target_delta: float

class AgentObjective(BaseModel):
    agent: str
    objective: str

class ScenarioDefinition(BaseModel):
    id: str
    name: str
    description: str
    trigger: ScenarioTrigger
    timeline: List[Dict[str, Any]]
    expected_kpis: List[ExpectedKPI]
    agent_objectives: List[AgentObjective]
