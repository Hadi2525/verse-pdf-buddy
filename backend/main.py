from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from utils.format_request import format_context_list
from utils.pdf_reader import get_pdf_in_bytes, read_from_pdf_in_bytes
import asyncio
from services.vector_db import VectorDB
from google.genai import Client as GoogleClient
from core.config import GEMINI_API_KEY, GEMINI_MODEL, EMBEDDING_MODEL, SYSTEM_PROMPT
import ollama
from services.llm_service import LLMService
from typing import List, Dict
from pydantic import BaseModel

vector_db = VectorDB()
google_client = GoogleClient(api_key=GEMINI_API_KEY)
embedding_function = ollama.AsyncClient()
llm_service = LLMService(provider="gemini")

class GenerateRequest(BaseModel):
    messages: List[Dict[str, str]]
    top_searches: int = 5
    model: str = GEMINI_MODEL
    max_tokens: int = 300

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Add CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

@app.get("/favicon.ico")
async def serve_favicon():
    return FileResponse("static/favicon.ico")

@app.post("/generate-response")
async def generate_response(req: GenerateRequest):
    try:
        # Extract the latest user message
        user_message = next((msg["content"] for msg in reversed(req.messages) if msg["role"] == "user"), None)
        if not user_message:
            raise HTTPException(status_code=400, detail="No user message found in the input")


        # Retrieve relevant content from the vector database
        search_results = await vector_db.find(user_message, req.top_searches)

        # Format the retrieved content as context
        context = format_context_list(search_results)

        system_prompt = f"""You are a helpful AI assistant created by xAI. Use the following context to inform your responses:

                        {context}

                        Instructions:
                        1. Provide accurate and relevant responses based on the given context.
                        2. If the context doesn't contain sufficient information to answer, say so clearly.
                        3. Maintain a neutral and professional tone.
                        4. Do not make up information not present in the context or your training data.
                        """

        # Append the context to the conversation
        messages = req.messages.copy()
        for msg in messages:
            if msg["role"] == "user" and msg["content"] == user_message:
                msg["content"] = user_message
        messages.append({"role": "system", "content": system_prompt})

        # Generate a response using the LLM service
        english_response = llm_service.generate_response(
            messages=messages,
            model=req.model,
            max_tokens=req.max_tokens
        )


        final_response = english_response.content

        return {
            "response": final_response,
            "context": context,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response from Backend: {str(e)}")

@app.get("/find")
async def find_vector(query: str, top_searches: int = 5):
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter is required")
        
    result = await vector_db.find(query, top_searches)
    return {"results": result}

@app.post("/insert")
async def insert_doc(document: Dict):
    if vector_db.insert(document):
        return {"status": "insert success"}
    return {"status": "insert failed"}

@app.post("/index-pdf")
async def index_documents(
    file: UploadFile = File(...),
    starting_page: int = 1,
    ending_page: int = 1
):
    try:
        # Validate parameters
        if starting_page < 1:
            raise HTTPException(status_code=400, detail="starting_page must be >= 1")
        if ending_page < 1:
            raise HTTPException(status_code=400, detail="ending_page must be >= 1")
        
        # Check file format
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="invalid file format")
            
        # Read the file contents directly into bytes
        pdf_bytes = await file.read()
        pdf_pages_in_bytes = get_pdf_in_bytes(pdf_bytes)
        
        # Process pages
        for page_number, page in enumerate(pdf_pages_in_bytes[starting_page-1:ending_page+1], start=starting_page):
            page_in_json = read_from_pdf_in_bytes(
                page=page,
                google_client=google_client,
                system_prompt=SYSTEM_PROMPT
            )
            
            for item in page_in_json:
                aembeddings = await embedding_function.embed(
                    model=EMBEDDING_MODEL,
                    input=item["text"]
                )
                embeddings = aembeddings["embeddings"][0]
                document = {
                    "content": item["text"],
                    "reference": item["reference"],
                    "document_embedding": embeddings
                }
                vector_db.insert(document)
                await asyncio.sleep(0.5)  # Rate limiting
            
            await asyncio.sleep(1)  # Avoid API quota limits
                
        return {
            "message": "PDF processed successfully",
            "filename": file.filename,
            "size": len(pdf_bytes),
            "page_count": len(pdf_pages_in_bytes),
            "status": "indexed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")