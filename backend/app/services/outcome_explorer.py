import json
import uuid
from sklearn.cluster import AgglomerativeClustering
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import OutcomeCluster, FutureOutcome
from .ai.ollama import UnifiedAIProvider

class OutcomeSpaceExplorer:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.provider = UnifiedAIProvider()

    async def cluster_outcomes(self, scenario_id: str, outcomes_data: list):
        """
        Takes raw Monte Carlo outcome rows (cost, delay, risk_score), clusters them using Agglomerative Clustering,
        and generates executive cluster insights.
        """
        if not outcomes_data or len(outcomes_data) < 2:
            return []

        # Prepare X matrix
        X = np.array([[o['cost'], o['delay'], o['risk']] for o in outcomes_data])
        
        # Determine clusters (assume 4 primary clusters: Winning, Acceptable, Failing, Catastrophic)
        n_clusters = min(4, len(X))
        clustering = AgglomerativeClustering(n_clusters=n_clusters).fit(X)
        labels = clustering.labels_

        clusters = []
        cluster_types = ["Winning Futures", "Acceptable Futures", "Failing Futures", "Catastrophic Futures"]
        
        for i in range(n_clusters):
            cluster_members = X[labels == i]
            centroid = cluster_members.mean(axis=0)
            
            # Simple heuristic for label assignment based on cost and risk centroid
            avg_impact = centroid[0] + centroid[2] * 1000000 
            
            # Generate AI insights for cluster
            query = f"Provide 2 recommended actions for an enterprise outcome cluster defined by: Cost=${centroid[0]}M, Delay={centroid[1]} days, Risk Score={centroid[2]}."
            system_prompt = "Output valid JSON containing a key 'actions' which is a list of strings."
            ai_response = await self.provider.generate_text(query, system_prompt, temperature=0.1)
            actions = ["Analyze further"]
            try:
                if "```json" in ai_response:
                    ai_response = ai_response.split("```json")[1].split("```")[0]
                actions = json.loads(ai_response.strip()).get("actions", actions)
            except Exception:
                pass

            cluster = OutcomeCluster(
                id=str(uuid.uuid4()),
                scenario_id=scenario_id,
                label=cluster_types[i % len(cluster_types)],
                centroid_coordinates={"cost": centroid[0], "delay": centroid[1], "risk": centroid[2]},
                member_count=len(cluster_members),
                avg_impact=avg_impact,
                recommended_actions=actions
            )
            self.db.add(cluster)
            clusters.append(cluster)

        await self.db.commit()
        return clusters
