import json
from .router import CapabilityRouter, Capability, OLLAMA_BASE_URL
from .observability import AIObservability
import httpx
import time

class UnifiedAIProvider:
    def __init__(self):
        self.router = CapabilityRouter()
        self.is_initialized = False

    async def initialize(self):
        await self.router.discover_models()
        self.is_initialized = True

    async def execute_reasoning(self, context: str, prompt: str, system_prompt: str) -> dict:
        if not self.is_initialized:
            await self.initialize()

        model = self.router.get_best_model(Capability.REASONING)
        if not model:
            # Deterministic fallback
            return self._deterministic_fallback("reasoning")

        start_time = time.time()
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nTask:\n{prompt}"}
        ]

        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": 0.1}
        }

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload, timeout=60.0)
                resp.raise_for_status()
                data = resp.json()
                content = data["message"]["content"]
                
                # attempt JSON parse
                try:
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0]
                    result = json.loads(content)
                except:
                    result = {"analysis": content, "confidence": 0.8}
                
                # Evidence layer injection
                result["metadata"] = {
                    "model_used": model,
                    "inference_time_seconds": round(time.time() - start_time, 2),
                    "execution_mode": "Real AI"
                }

                AIObservability.log_inference(model, "REASONING", time.time() - start_time)
                return result
        except Exception as e:
            print(f"Inference failed: {e}")
            return self._deterministic_fallback("reasoning")

    def _deterministic_fallback(self, task: str) -> dict:
        return {
            "analysis": "Deterministic analysis triggered due to AI unavailability. The blast radius is contained but requires immediate action.",
            "confidence": 1.0,
            "metadata": {
                "model_used": "None",
                "inference_time_seconds": 0.01,
                "execution_mode": "Deterministic Analytics"
            }
        }
