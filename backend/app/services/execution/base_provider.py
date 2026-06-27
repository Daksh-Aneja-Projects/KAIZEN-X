from abc import ABC, abstractmethod
from typing import Dict, Any

class ExecutionProvider(ABC):
    @abstractmethod
    async def execute_action(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_status(self, execution_id: str) -> str:
        pass

class MockExecutionProvider(ExecutionProvider):
    async def execute_action(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "SUCCESS", "mock": True, "details": "Action executed successfully in mock mode."}

    async def get_status(self, execution_id: str) -> str:
        return "COMPLETED"

class UiPathExecutionProvider(ExecutionProvider):
    async def execute_action(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        # Orchestrator API integration would go here
        # E.g., httpx.post("https://cloud.uipath.com/.../odata/Jobs/UiPath.Server.Configuration.OData.StartJobs")
        return {"status": "TRIGGERED", "job_id": "uipath_job_123"}

    async def get_status(self, execution_id: str) -> str:
        return "COMPLETED"

class ServiceNowConnector(ExecutionProvider):
    async def execute_action(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "SUCCESS", "ticket_id": "INC001002"}
        
    async def get_status(self, execution_id: str) -> str:
        return "COMPLETED"

class SlackConnector(ExecutionProvider):
    async def execute_action(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "SUCCESS", "message_ts": "123456789.00"}
        
    async def get_status(self, execution_id: str) -> str:
        return "COMPLETED"

def get_provider(connector_type: str) -> ExecutionProvider:
    connectors = {
        "UiPath": UiPathExecutionProvider(),
        "ServiceNow": ServiceNowConnector(),
        "Slack": SlackConnector(),
        "Mock": MockExecutionProvider()
    }
    return connectors.get(connector_type, MockExecutionProvider())
