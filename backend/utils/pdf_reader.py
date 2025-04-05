"""
This file contains the utility functions to read the pdf file and get the response from the google client.
"""

from google.genai import types
from google.genai import Client as GoogleClient
import PyPDF2
import io
import json

def get_pdf_in_bytes(pdf_bytes):
    """
    Read the pdf file and return the bytes.

    Args:
        pdf_bytes (bytes): PDF file in bytes
    
    Returns:
        list: PDF file pages in bytes
    """
    
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    # Get individual pages as bytes
    pdf_bytes_pages = []
    for page in pdf_reader.pages:
        output = io.BytesIO()
        pdf_writer = PyPDF2.PdfWriter()
        pdf_writer.add_page(page)
        pdf_writer.write(output)
        pdf_bytes_pages.append(output.getvalue())

    return pdf_bytes_pages


from pydantic import BaseModel, field_validator
import re

class DocumentParser(BaseModel):
    """
    Document parser model
    """
    reference: str
    text: str

    @field_validator("reference")
    def validate_reference(cls, value):
        # Check if the value matches the pattern "chapter:verse"
        if not isinstance(value, str):
            raise ValueError("Reference must be a string")
        
        # Regular expression to match "chapter:verse" where both are positive integers
        pattern = r"^[1-9]\d*:[1-9]\d*$"
        if not re.match(pattern, value):
            raise ValueError(
                "Reference must be in the format 'chapter:verse' where both chapter and verse are positive integers (e.g., '2:22', '1:23')"
            )
        
        return value


def read_from_pdf_in_bytes(page, google_client: GoogleClient, system_prompt):
    """
    Read the content of the pdf in bytes and return the response from the google client.

    param pdf_bytes_pages: list
    param google_client: genai.Client
    param system_prompt: str
    param pages: list

    return: genai.Response
    """
    response = google_client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Part.from_bytes(
                data=page,
                mime_type='application/pdf',
            ),
            system_prompt],
        config={
            'response_mime_type': 'application/json',
            'response_schema': list[DocumentParser]
        })
    try:
        json_obj = json.loads(response.text)
        return json_obj
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {str(e)}")
        return {"reference": "", "text": ""}

    
