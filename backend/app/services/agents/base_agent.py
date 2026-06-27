import json
from sqlalchemy.ext.asyncio import AsyncSession
from ..ai.ollama import UnifiedAIProvider
from ..ai.context_compressor import ContextCompressor

class BaseAgent:
    def __init__(self, db: AsyncSession, name: str, role_description: str):
        self.db = db
        self.name = name
        self.role_description = role_description
        self.provider = UnifiedAIProvider()

    async def analyze(self, scenario_data: dict, graph_state: dict = None, center_node: str = None) -> dict:
        # Context Compression (RAG)
        context = ""
        if graph_state and center_node:
            context = ContextCompressor.compress_graph_state(graph_state, center_node)
        else:
            context = "Graph state not provided."

        prompt = f"""
        Role: {self.role_description}
        Scenario Data: {json.dumps(scenario_data)}
        
        Analyze the scenario and provide recommendations.
        Output MUST be pure JSON with keys:
        - recommendation (string)
        - reasoning (list of strings)
        - confidence (float 0.0-1.0)
        - complexity (float 0.0-1.0)
        - expected_benefit (float 0.0-1.0)
        - dependencies (list of strings)
        """
        
        system_prompt = "You are an autonomous enterprise intelligence agent. Output ONLY valid JSON."
        result = await self.provider.execute_reasoning(context, prompt, system_prompt)
        
        # Merge inference result with expected structure
        final_result = {
            "recommendation": result.get("recommendation", result.get("analysis", "No recommendation.")),
            "reasoning": result.get("reasoning", ["Reasoning generated from analysis."]),
            "confidence": result.get("confidence", 0.5),
            "complexity": result.get("complexity", 0.5),
            "expected_benefit": result.get("expected_benefit", 0.5),
            "dependencies": result.get("dependencies", []),
            "metadata": result.get("metadata", {})
        }
        return final_result
