from google import genai
from google.genai import types

from dotenv import load_dotenv
load_dotenv()
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def embeddings_function(text):
    """
    This function takes a string input and returns its embeddings using the Gemini API.
    Args:
        text (str): The input string to be embedded.
    Returns:
        list: The embeddings of the input string.
        
    """
    result = client.models.embed_content(
            model=os.getenv("EMBEDDING_MODEL"),
            contents=text,
            config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
    )
    return result.embeddings[0].values