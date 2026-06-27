import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from ...models import ExecutionPlan, ExecutionAction, ApprovalRequest, WorkflowExecution, EventLedger
from .base_provider import get_provider

class ActionOrchestrator:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_plan(self, scenario_id: str, recovery_path_id: str) -> ExecutionPlan:
        # Translates a high level recovery path into discrete execution actions
        plan = ExecutionPlan(
            id=str(uuid.uuid4()),
            scenario_id=scenario_id,
            recovery_path_id=recovery_path_id,
            status="PENDING_APPROVAL",
            success_probability=0.92
        )
        self.db.add(plan)
        
        # Action 1: Notify War Room
        a1 = ExecutionAction(
            id=str(uuid.uuid4()), plan_id=plan.id, connector_type="Slack",
            action_type="Notify", payload={"message": "Initiating Recovery Protocol X"},
            execution_order=1, requires_approval=False
        )
        # Action 2: UiPath Failover
        a2 = ExecutionAction(
            id=str(uuid.uuid4()), plan_id=plan.id, connector_type="UiPath",
            action_type="TriggerRPA", payload={"process": "FailoverDB", "env": "prod"},
            execution_order=2, requires_approval=True
        )
        
        self.db.add_all([a1, a2])
        await self.db.flush()
        
        # Create approval request for a2
        app_req = ApprovalRequest(id=str(uuid.uuid4()), action_id=a2.id)
        self.db.add(app_req)
        
        await self.db.commit()
        return plan

    async def execute_plan(self, plan_id: str):
        # Starts the execution loop, querying actions ordered by execution_order
        from sqlalchemy import select
        res = await self.db.execute(select(ExecutionAction).where(ExecutionAction.plan_id == plan_id).order_by(ExecutionAction.execution_order))
        actions = res.scalars().all()
        
        execution = WorkflowExecution(id=str(uuid.uuid4()), plan_id=plan_id)
        self.db.add(execution)
        
        for action in actions:
            if action.requires_approval:
                req_res = await self.db.execute(select(ApprovalRequest).where(ApprovalRequest.action_id == action.id))
                approval = req_res.scalars().first()
                if not approval or approval.status != "APPROVED":
                    action.status = "BLOCKED"
                    execution.status = "HALTED"
                    break
            
            provider = get_provider(action.connector_type)
            result = await provider.execute_action(action.payload)
            action.status = "COMPLETED"
            
            # Log event
            ledger = EventLedger(id=str(uuid.uuid4()), entity_type="Action", entity_id=action.id, event_type="ActionExecuted", payload=result)
            self.db.add(ledger)
            
        await self.db.commit()
        return execution
