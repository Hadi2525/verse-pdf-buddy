from openai import OpenAI
from core.config import GEMINI_API_KEY, GEMINI_BASE_URL




class LLMService:
    """
    A service class to handle API calls to various Large Language Model (LLM) providers.
    """

    def __init__(self, provider: str):
        """
        Initialize the LLMService with API key, base URL, and provider.
        
        :param api_key: The API key for authenticating with the LLM service.
        :param base_url: The base URL of the LLM API.
        :param provider: The LLM provider (e.g., "openai", "gemini", "anthropic", "groq").
        """
        if provider == "openai":
            #TODO: Do the OpenAI API key later
            pass
        
        elif provider == "gemini":
            self.client = OpenAI(
                api_key=GEMINI_API_KEY,
                base_url=GEMINI_BASE_URL
            )
        self.provider = provider.lower()


    def generate_response(self, messages: str, model: str, max_tokens: int = 300) -> dict:
        """
        Send a messages to the LLM API and get a response.
        
        :param messages: The input messages for the LLM.
        :param model: The model to use for the LLM (default depends on the provider).
        :param max_tokens: The maximum number of tokens to generate in the response.
        :return: The response from the LLM API as a dictionary.
        """

        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens
            )
            return response.choices[0].message
        except Exception as e:
            print(f"Error while calling {self.provider} API: {e}")
            return {"error": str(e)}