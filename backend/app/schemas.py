from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime
from .models import Severity, TwinNodeType, TwinEdgeType

# Legacy schemas (kept for compat)
class EventSchema(BaseModel):
    id: str
    timestamp: datetime
    title: str
    description: str
    severity: Severity
    source: str
    affected_entities: List[str]
    impact_score: float
    class Config: from_attributes = True

class RiskSchema(BaseModel):
    id: str
    name: str
    probability: float
    severity: float
    impact: float
    status: str
    category: str
    class Config: from_attributes = True

class MetricSchema(BaseModel):
    health_score: float
    risk_exposure: int
    critical_risks: int
    projected_savings: float
    recovery_success_rate: float
    class Config: from_attributes = True

class DashboardOverview(BaseModel):
    metrics: MetricSchema
    status: str
    active_event_count: int

class OutlookCase(BaseModel):
    type: str
    probability: float
    financial_impact: float

class DashboardOutlook(BaseModel):
    best_case: OutlookCase
    expected_case: OutlookCase
    worst_case: OutlookCase

class BriefingResponse(BaseModel):
    briefing: str

# New Twin schemas
class TwinNodeSchema(BaseModel):
    id: str
    label: str
    type: TwinNodeType
    status: str
    health_score: float
    metadata_json: Dict[str, Any]
    class Config: from_attributes = True

class TwinEdgeSchema(BaseModel):
    id: str
    source_id: str
    target_id: str
    type: TwinEdgeType
    weight: float
    class Config: from_attributes = True

class TwinGraphResponse(BaseModel):
    nodes: List[TwinNodeSchema]
    edges: List[TwinEdgeSchema]
    overall_health: float
