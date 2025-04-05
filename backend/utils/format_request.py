
"""
Format the queries to fit the request format for endpoints
"""
from datetime import datetime
# import pyquran as pq

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

def format_context_list(context_list):
    result = ""
    for i, item in enumerate(context_list, 1):
        result += f"content {i}:\n"
        result += f"text: {item['text']}\n"
        # Round relevance_score to 4 decimal places
        rounded_score = round(item['search_score'], 4)
        result += f"relevance_score: {rounded_score}\n"
        # Add an extra newline between entries (except after the last one)
        if i < len(context_list):
            result += "\n"
    return result
