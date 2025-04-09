import { GenerateRequest, APIResponse } from "../types";

// Get the base URL from environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const api = {
  getBaseUrl: () => API_URL,
  
  async generateResponse(request: GenerateRequest): Promise<APIResponse> {
    try {
      const response = await fetch(`${API_URL}/generate-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate response: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  },

  async findReferences(query: string, top_searches: number = 5): Promise<any> {
    try {
      const response = await fetch(
        `${API_URL}/find?query=${encodeURIComponent(query)}&top_searches=${top_searches}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to find references: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error finding references:", error);
      throw error;
    }
  },

  async uploadPdf(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const url = `${API_URL}/index-pdf`;
      
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload PDF: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  },

  getPdfUrl: (fileId: string) => {
    return `${API_URL}/preview-pdf/${fileId}`;
  },
  
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      console.log(`File ${fileId} would be deleted on the server`);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }
};