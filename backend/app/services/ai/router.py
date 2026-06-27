import httpx
from enum import Enum
import os

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

class Capability(Enum):
    REASONING = "reasoning"
    CODING = "coding"
    EMBEDDING = "embedding"
    LONG_CONTEXT = "long_context"
    GENERAL = "general"

class CapabilityRouter:
    def __init__(self):
        self.models = []
        self.capability_map = {
            Capability.REASONING: [],
            Capability.CODING: [],
            Capability.EMBEDDING: [],
            Capability.LONG_CONTEXT: [],
            Capability.GENERAL: []
        }

    async def discover_models(self):
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5.0)
                if resp.status_code == 200:
                    data = resp.json()
                    self.models = [m["name"] for m in data.get("models", [])]
                    self._classify_models()
                else:
                    print("Failed to discover models. Falling back to deterministic.")
        except Exception as e:
            print(f"Error discovering models: {e}. Falling back to deterministic.")

    def _classify_models(self):
        for model in self.models:
            model_lower = model.lower()
            if "embed" in model_lower:
                self.capability_map[Capability.EMBEDDING].append(model)
            elif "coder" in model_lower or "code" in model_lower or "qwen" in model_lower:
                # Qwen is great at coding, we can classify appropriately
                self.capability_map[Capability.CODING].append(model)
                self.capability_map[Capability.GENERAL].append(model)
            elif "deepseek" in model_lower or "r1" in model_lower or "reason" in model_lower:
                self.capability_map[Capability.REASONING].append(model)
            elif "32k" in model_lower or "128k" in model_lower:
                self.capability_map[Capability.LONG_CONTEXT].append(model)
            else:
                self.capability_map[Capability.GENERAL].append(model)
                # Fallback, any model can be reasoning
                self.capability_map[Capability.REASONING].append(model)

    def get_best_model(self, capability: Capability) -> str:
        candidates = self.capability_map.get(capability, [])
        if candidates:
            return candidates[0]
        # Fallback to general
        if self.capability_map[Capability.GENERAL]:
            return self.capability_map[Capability.GENERAL][0]
        return "" # Empty string means fallback to deterministic
