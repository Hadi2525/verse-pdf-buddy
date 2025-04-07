
"""
Format the queries to fit the request format for endpoints
"""
from datetime import datetime

def format_inserts(data):
    """
    Format the query to insert into MongoDB
    """
    return {
        "text": data["content"],
        "reference": data["reference"],
        "timestamp": datetime.now(),
        "document_embedding": data["document_embedding"],
    }

def format_context_list(search_results):
    """
    Format search results into a markdown-friendly context string
    
    Args:
        search_results (list): List of search results
        
    Returns:
        str: Formatted context string
    """
    if not search_results:
        return "No relevant information found."
    
    # Format each result into clean markdown
    formatted_results = []
    for result in search_results:
        if "content" in result and "reference" in result:
            formatted_results.append(f"### {result['reference']}\n\n{result['content']}\n")
    
    # Join all formatted results
    context = "\n".join(formatted_results)
    return context
