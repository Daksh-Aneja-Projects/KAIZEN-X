import random

class ConfidenceEngine:
    @staticmethod
    def calculate_confidence(graph_distance: int, data_freshness: float, historical_accuracy: float) -> dict:
        """
        Calculates confidence metrics based on graph topology and available data quality.
        """
        # Base confidence drops as we go deeper into the graph
        decay_per_hop = 0.15
        base_confidence = max(0.1, 1.0 - (graph_distance * decay_per_hop))
        
        data_quality_score = data_freshness * 0.8 + random.uniform(0.1, 0.2)
        reasoning_quality_score = historical_accuracy * 0.9 + random.uniform(0.05, 0.1)
        evidence_score = (data_quality_score + reasoning_quality_score) / 2.0
        
        # Final combined confidence
        confidence = base_confidence * 0.6 + evidence_score * 0.4
        
        return {
            "confidence": round(min(1.0, max(0.0, confidence)), 3),
            "evidence_score": round(min(1.0, max(0.0, evidence_score)), 3),
            "data_quality_score": round(min(1.0, max(0.0, data_quality_score)), 3),
            "reasoning_quality_score": round(min(1.0, max(0.0, reasoning_quality_score)), 3)
        }
