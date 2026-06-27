from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base
from pgvector.sqlalchemy import Vector

class Severity(enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TwinNodeType(enum.Enum):
    DEPARTMENT = "Department"
    EMPLOYEE = "Employee"
    PROJECT = "Project"
    VENDOR = "Vendor"
    RISK = "Risk"
    SYSTEM = "System"
    APPLICATION = "Application"
    CONTRACT = "Contract"
    GOAL = "Goal"
    INITIATIVE = "Initiative"
    LOCATION = "Location"
    BUSINESS_PROCESS = "BusinessProcess"
    KPI = "KPI"
    RISK_CONTROL = "RiskControl"

class TwinEdgeType(enum.Enum):
    DEPENDS_ON = "depends_on"
    BLOCKS = "blocks"
    SUPPLIES = "supplies"
    OWNS = "owns"
    REPORTS_TO = "reports_to"
    SUPPORTS = "supports"
    IMPACTS = "impacts"
    MITIGATES = "mitigates"
    CONNECTED_TO = "connected_to"
    DRIVES = "drives"
    MEASURES = "measures"

# ---- Digital Twin Relational Mirror (Synced to Neo4j) ----

class TwinNode(Base):
    __tablename__ = "twin_nodes"
    id = Column(String, primary_key=True)
    label = Column(String)
    type = Column(Enum(TwinNodeType))
    status = Column(String, default="Healthy") 
    health_score = Column(Float, default=100.0)
    metadata_json = Column(JSON, default={})

class TwinEdge(Base):
    __tablename__ = "twin_edges"
    id = Column(String, primary_key=True)
    source_id = Column(String, ForeignKey("twin_nodes.id"))
    target_id = Column(String, ForeignKey("twin_nodes.id"))
    type = Column(Enum(TwinEdgeType))
    weight = Column(Float, default=1.0)

# ---- Event Sourcing Ledger ----

class EventLedger(Base):
    __tablename__ = "event_ledger"
    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    entity_type = Column(String)
    entity_id = Column(String)
    event_type = Column(String)
    payload = Column(JSON)

# ---- Simulation & Futures Models ----

class FutureScenario(Base):
    __tablename__ = "future_scenarios"
    id = Column(String, primary_key=True)
    name = Column(String)
    description = Column(String)
    parameters = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class FutureFamily(Base):
    __tablename__ = "future_families"
    id = Column(String, primary_key=True)
    name = Column(String)
    description = Column(String)
    probability = Column(Float)
    impact_severity = Column(String)

class FutureBranch(Base):
    __tablename__ = "future_branches"
    id = Column(String, primary_key=True)
    scenario_id = Column(String, ForeignKey("future_scenarios.id"))
    parent_id = Column(String, nullable=True) # for tree structure
    name = Column(String)
    probability = Column(Float)
    metrics = Column(JSON)
    
class OutcomeCluster(Base):
    __tablename__ = "outcome_clusters"
    id = Column(String, primary_key=True)
    scenario_id = Column(String, ForeignKey("future_scenarios.id"))
    label = Column(String) # Winning, Acceptable, Failing, Catastrophic
    centroid_coordinates = Column(JSON)
    member_count = Column(Integer)
    avg_impact = Column(Float)
    recommended_actions = Column(JSON)

class FutureOutcome(Base):
    __tablename__ = "future_outcomes"
    id = Column(String, primary_key=True)
    scenario_id = Column(String, ForeignKey("future_scenarios.id"))
    expected_case_impact = Column(Float)
    worst_case_impact = Column(Float)
    best_case_impact = Column(Float)
    confidence = Column(Float)
    outcome_distribution = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class DecisionPoint(Base):
    __tablename__ = "decision_points"
    id = Column(String, primary_key=True)
    scenario_id = Column(String, ForeignKey("future_scenarios.id"))
    decision_type = Column(String)
    options = Column(JSON)

class RecoveryPath(Base):
    __tablename__ = "recovery_paths"
    id = Column(String, primary_key=True)
    scenario_id = Column(String, ForeignKey("future_scenarios.id"))
    steps = Column(JSON)
    success_probability = Column(Float)
    estimated_duration_days = Column(Integer)

class ScenarioState(Base):
    __tablename__ = "scenario_states"
    id = Column(String, primary_key=True)
    name = Column(String)
    state = Column(String)
    progress = Column(Float)
    timeline = Column(JSON)
    impact_metrics = Column(JSON)

# ---- pgvector Memory Layer ----

class MemoryEmbedding(Base):
    __tablename__ = "memory_embeddings"
    id = Column(String, primary_key=True)
    memory_type = Column(String) # Incident, Recovery, Scenario
    content = Column(String)
    metadata_json = Column(JSON)
    embedding = Column(Vector(768)) # For nomic-embed-text/bge-m3 default dims, adjust if needed
    timestamp = Column(DateTime, default=datetime.utcnow)

class AgentInteraction(Base):
    __tablename__ = "agent_interactions"
    id = Column(String, primary_key=True)
    scenario_id = Column(String, ForeignKey("future_scenarios.id"))
    agent_name = Column(String)
    prompt = Column(String)
    reasoning = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AgentRecommendation(Base):
    __tablename__ = "agent_recommendations"
    id = Column(String, primary_key=True)
    scenario_id = Column(String, ForeignKey("future_scenarios.id"))
    agent_name = Column(String)
    recommendation = Column(String)
    confidence = Column(Float)
    complexity = Column(Float)
    expected_benefit = Column(Float)
    dependencies = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

class ConsensusResult(Base):
    __tablename__ = "consensus_results"
    id = Column(String, primary_key=True)
    scenario_id = Column(String, ForeignKey("future_scenarios.id"))
    agreement_score = Column(Float)
    conflict_score = Column(Float)
    executive_confidence = Column(Float)
    execution_readiness_score = Column(Float)
    final_recommendation = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class ExecutionPlan(Base):
    __tablename__ = "execution_plans"
    id = Column(String, primary_key=True)
    scenario_id = Column(String, ForeignKey("future_scenarios.id"))
    recovery_path_id = Column(String, ForeignKey("recovery_paths.id"))
    status = Column(String, default="PENDING")
    success_probability = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class ExecutionAction(Base):
    __tablename__ = "execution_actions"
    id = Column(String, primary_key=True)
    plan_id = Column(String, ForeignKey("execution_plans.id"))
    connector_type = Column(String) # ServiceNow, UiPath, Slack, etc.
    action_type = Column(String)
    payload = Column(JSON)
    status = Column(String, default="PENDING")
    execution_order = Column(Integer)
    dependencies = Column(JSON)
    requires_approval = Column(Boolean, default=False)
    rollback_strategy = Column(JSON)

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"
    id = Column(String, primary_key=True)
    action_id = Column(String, ForeignKey("execution_actions.id"))
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED, ESCALATED
    requested_at = Column(DateTime, default=datetime.utcnow)
    decision_at = Column(DateTime, nullable=True)
    reasoning = Column(String, nullable=True)

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"
    id = Column(String, primary_key=True)
    plan_id = Column(String, ForeignKey("execution_plans.id"))
    status = Column(String, default="IN_PROGRESS")
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    logs = Column(JSON, default=[])

class ExecutionResult(Base):
    __tablename__ = "execution_results"
    id = Column(String, primary_key=True)
    execution_id = Column(String, ForeignKey("workflow_executions.id"))
    kpi_delta = Column(JSON)
    risk_reduction = Column(Float)
    business_impact = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

# ---- Existing Dashboard Models ----

class Risk(Base):
    __tablename__ = "risks"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    severity = Column(Enum(Severity))
    status = Column(String)
    financial_exposure = Column(Float)
    probability = Column(Float)
    affected_entities = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events"
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    title = Column(String)
    description = Column(String)
    severity = Column(Enum(Severity))
    source = Column(String)
    affected_entities = Column(JSON)
    impact_score = Column(Float)

class EnterpriseMetric(Base):
    __tablename__ = "enterprise_metrics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    health_score = Column(Float)
    risk_exposure = Column(Integer)
    critical_risks = Column(Integer)
    projected_savings = Column(Float)
    recovery_success_rate = Column(Float)

class Employee(Base):
    __tablename__ = "employees"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    department_id = Column(String)
    role = Column(String)

class Department(Base):
    __tablename__ = "departments"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    headcount = Column(Integer)

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    risk_score = Column(Float)

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    status = Column(String)

