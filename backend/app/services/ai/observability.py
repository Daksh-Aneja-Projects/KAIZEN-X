import logging
import time
from functools import wraps
from typing import Callable, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ai_observability")

class AIObservability:
    @staticmethod
    def log_inference(model: str, task_type: str, latency: float, tokens: int = 0, cached: bool = False):
        status = "CACHE HIT" if cached else "INFERENCE"
        logger.info(f"[{status}] Model: {model} | Task: {task_type} | Latency: {latency:.2f}s | Tokens: {tokens}")

    @staticmethod
    def log_simulation(iterations: int, latency: float):
        logger.info(f"[SIMULATION] Iterations: {iterations} | Latency: {latency:.2f}s")

    @staticmethod
    def log_graph_traversal(nodes_visited: int, latency: float):
        logger.info(f"[GRAPH TRAVERSAL] Nodes: {nodes_visited} | Latency: {latency:.2f}s")
