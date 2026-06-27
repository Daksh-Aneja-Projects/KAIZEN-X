from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class LLMProvider(ABC):
    @abstractmethod
    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7) -> str:
        pass

class EmbeddingProvider(ABC):
    @abstractmethod
    async def get_embedding(self, text: str) -> List[float]:
        pass

class ReasoningProvider(ABC):
    @abstractmethod
    async def reason(self, context: str, query: str) -> Dict[str, Any]:
        """Should return structured reasoning like {"analysis": "...", "confidence": 0.9}"""
        pass
