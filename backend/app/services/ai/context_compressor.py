class ContextCompressor:
    @staticmethod
    def compress_graph_state(graph_state: dict, center_node_id: str, max_depth: int = 2) -> str:
        """
        Compresses a large enterprise graph state into a dense text summary suitable for RAG.
        Extracts only the critical path around the center node.
        """
        # Very simplified for now: just grab the node and direct dependencies
        if center_node_id not in graph_state:
            return "No relevant context found."
            
        center = graph_state[center_node_id]
        context = f"Primary Entity: {center.get('name')} ({center.get('type')})\n"
        
        deps = center.get("dependencies", [])
        if deps:
            context += "Critical Dependencies:\n"
            for d in deps[:10]: # Limit to top 10
                target = graph_state.get(d["target_id"])
                if target:
                    context += f"- Depends on {target.get('name')} ({target.get('type')})\n"
                    
        return context
