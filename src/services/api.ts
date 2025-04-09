
import { GenerateRequest, APIResponse } from "../types";

// Function to determine the correct API URL based on the environment
function determineApiUrl() {
  // Get the base URL from environment variable with fallback
  const configuredUrl = import.meta.env.VITE_API_URL;
  
  // If explicitly configured, use that
  if (configuredUrl) {
    return configuredUrl;
  }
  
  // In production/Docker, if we're running from the same server, use relative URLs
  // This ensures API requests go to the same host that served the frontend
  if (import.meta.env.PROD) {
    return '';
  }
  
  // For local development, fallback to localhost
  return "http://localhost:8080";
}

// Get the base URL according to our environment
const API_URL = determineApiUrl();

export const api = {
  getBaseUrl: () => API_URL,
  
  async generateResponse(request: GenerateRequest): Promise<APIResponse> {
    try {
      const url = API_URL ? `${API_URL}/generate-response` : '/generate-response';
      const response = await fetch(url, {
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
      const url = API_URL 
        ? `${API_URL}/find?query=${encodeURIComponent(query)}&top_searches=${top_searches}`
        : `/find?query=${encodeURIComponent(query)}&top_searches=${top_searches}`;
        
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

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
      
      const url = API_URL ? `${API_URL}/index-pdf` : '/index-pdf';
      
      console.log("Uploading PDF to URL:", url);
      
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
    return API_URL ? `${API_URL}/preview-pdf/${fileId}` : `/preview-pdf/${fileId}`;
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
