from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from utils.format_request import format_context_list
from mistralai import Mistral
from gridfs import GridFS
from services.vector_db import VectorDB
from core.config import GEMINI_MODEL, EMBEDDING_MODEL
import ollama
from services.llm_service import LLMService
from typing import List, Dict
from pydantic import BaseModel
import os
from io import BytesIO
from bson.objectid import ObjectId
from gridfs.errors import NoFile
from urllib.parse import quote

vector_db = VectorDB()
fs = GridFS(vector_db.db)
mistral_client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

embedding_function = ollama.AsyncClient()
llm_service = LLMService(provider="gemini")

class GenerateRequest(BaseModel):
    messages: List[Dict[str, str]]
    top_searches: int = 5
    model: str = GEMINI_MODEL
    max_tokens: int = 300

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

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
async def index_documents(file: UploadFile = File(...)):
    vector_db.clean_collection()
    try:
        # Validate file type
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Read PDF bytes
        pdf_bytes = await file.read()

        # Save to GridFS
        with fs.new_file(filename=file.filename, content_type=file.content_type) as grid_out:
            grid_out.write(pdf_bytes)
            file_id = grid_out._id

        # Process OCR using Mistral AI
        # Prepare file content as bytes for Mistral upload
        file_content = BytesIO(pdf_bytes)
        
        # Upload the file to Mistral
        uploaded_file = mistral_client.files.upload(
            file={
                "file_name": file.filename,
                "content": file_content.getvalue(),  # Get bytes from BytesIO
            },
            purpose="ocr"
        )

        # Retrieve signed URL from Mistral
        signed_url = mistral_client.files.get_signed_url(file_id=uploaded_file.id)

        # Perform OCR processing using the signed URL
        ocr_response = mistral_client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "document_url",
                "document_url": signed_url.url  # Access URL as attribute
            }
        )

        page_count = 0
        if hasattr(ocr_response, 'pages'):
            for idx, page in enumerate(ocr_response.pages):
                text = page.text if hasattr(page, 'text') else str(page)
                reference = f"Page {idx + 1}"
                aembeddings = await embedding_function.embed(
                    model=EMBEDDING_MODEL,
                    input=text
                )
                embeddings = aembeddings["embeddings"][0]
                document = {
                    "content": text,
                    "reference": reference,
                    "document_embedding": embeddings
                }
                vector_db.insert(document)
                page_count += 1
        else:
            # Fallback for single page or different structure
            text = str(ocr_response)
            aembeddings = await embedding_function.embed(
                model=EMBEDDING_MODEL,
                input=text
            )
            embeddings = aembeddings["embeddings"][0]
            document = {
                "content": text,
                "reference": "Page 1",
                "document_embedding": embeddings
            }
            vector_db.insert(document)
            page_count = 1

        # Ensure all IDs are serialized properly
        response = {
            "message": "PDF processed successfully",
            "filename": file.filename,
            "size": len(pdf_bytes),
            "page_count": page_count,
            "file_id": str(file_id),  # Convert MongoDB ObjectId to string
            "ocr_result_id": str(uploaded_file.id),  # Ensure Mistral file ID is a string
            "status": "indexed",
            "file_details": {
                "id": str(file_id),  # Use MongoDB file_id, converted to string
                "filename": file.filename  # No need for hasattr check here, file.filename is always available
            }
        }

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    
    
@app.get("/preview-pdf/{file_id}")
async def preview_pdf(file_id: str):
    """
    Stream a PDF file from GridFS using the file ID.
    """
    try:
        # Validate file_id
        if not ObjectId.is_valid(file_id):
            raise HTTPException(status_code=400, detail="Invalid file ID format")

        file_id_obj = ObjectId(file_id)

        # Retrieve the file from GridFS
        grid_file = fs.get(file_id_obj)

        # Stream the PDF in chunks
        def stream_pdf():
            chunk_size = 8192  # 8KB chunks
            while True:
                data = grid_file.read(chunk_size)
                if not data:
                    break
                yield data

        # Safely encode filename for Content-Disposition header
        filename_encoded = quote(grid_file.filename)
        content_disposition = f'inline; filename="{grid_file.filename}"; filename*=UTF-8\'\'{filename_encoded}'

        # Return streaming response
        return StreamingResponse(
            stream_pdf(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": content_disposition,
                "Content-Length": str(grid_file.length),
            }
        )

    except NoFile:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving PDF: {str(e)}")
    finally:
        if 'grid_file' in locals():
            grid_file.close()