
import { GenerateRequest, FileInfo, APIResponse } from "../types";

// Configure your backend URL here
const API_URL = "http://localhost:8000"; // Change this to your actual backend URL

export const api = {
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

  async uploadPdf(file: File, startPage: number, endPage: number): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use URL parameters for starting_page and ending_page
      const url = `${API_URL}/index-pdf?starting_page=${startPage}&ending_page=${endPage}`;
      
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload PDF: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  },
};
