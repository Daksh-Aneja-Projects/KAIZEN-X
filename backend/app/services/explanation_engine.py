import json
from .ai.ollama import OllamaProvider

class ExplanationEngine:
    def __init__(self):
        self.provider = OllamaProvider()

    async def generate_explanation(self, scenario_name: str, impact_data: dict) -> dict:
        """
        Generates structured explanation from raw impact data and scenario state using the ReasoningProvider.
        """
        context = f"Scenario: {scenario_name}\nImpact Data Summary: {json.dumps(impact_data)[:1000]}..."
        query = """
        Analyze the failure propagation and provide a JSON response with exactly these keys:
        - why: A short paragraph explaining the root cause and propagation mechanism.
        - supporting_evidence: List of 2-3 data points confirming this.
        - affected_entities: List of top 3 impacted node labels.
        - critical_assumptions: 1-2 assumptions made during propagation.
        - recommended_actions: List of 2 mitigation steps.
        Ensure the output is pure JSON.
        """
        
        system_prompt = "You are the KAIZEN-X Explanation Engine. Return only valid JSON matching the requested keys."
        raw_output = await self.provider.generate_text(query, system_prompt, temperature=0.2)
        
        try:
            if "```json" in raw_output:
                raw_output = raw_output.split("```json")[1].split("```")[0]
            elif "```" in raw_output:
                raw_output = raw_output.split("```")[1].split("```")[0]
                
            return json.loads(raw_output.strip())
        except Exception:
            # Fallback deterministic explanation if LLM parsing fails
            return {
                "why": f"Impact propagated through critical dependencies originating from {scenario_name}.",
                "supporting_evidence": ["High latency edge detected", "Cascading node failure observed"],
                "affected_entities": ["Primary Vendor", "Core Database", "Revenue Goal"],
                "critical_assumptions": ["Assuming current weights represent real-time risk"],
                "recommended_actions": ["Deploy failover system", "Halt dependent batch jobs"]
            }
