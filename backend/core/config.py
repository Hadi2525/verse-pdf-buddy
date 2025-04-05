from dotenv import load_dotenv, find_dotenv
import os

_ = load_dotenv(find_dotenv())

MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE")
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION")
MONGODB_SEARCH_INDEX_NAME = os.getenv("MONGODB_SEARCH_INDEX_NAME")
MONGODB_SEARCH_TOP_K = os.getenv("MONGODB_SEARCH_TOP_K")
MONGODB_VECTOR_EMBEDDING_PATH = os.getenv("MONGODB_VECTOR_EMBEDDING_PATH")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL")
GEMINI_MODEL = "gemini-2.0-flash"


SYSTEM_PROMPT = """
Read the content of the document and put each meaningful content that builds a story in a separate line. 
Make sure to clarify all he, him, they, them, these, those, I, it, you, us, their, us etc. by referring to the origin inside a parantheses. 
Tag each line with the corresponding chapter and verse number. 
I want the output to be of a json format. Do not put any additional words just the JSON response.
"""

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL")
