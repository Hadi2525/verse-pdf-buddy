
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
        if "text" in result and "reference" in result:
            # Clean up the markdown text by removing the technical dimensions part
            content = result['text'].split("mensions")[0] if "mensions" in result['text'] else result['text']
            formatted_results.append(f"### {result['reference']}\n\n{content.strip()}\n")
    
    # Join all formatted results
    context = "\n".join(formatted_results)
    return context
