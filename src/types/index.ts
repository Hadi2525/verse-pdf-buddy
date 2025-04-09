
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatMessage extends Message {
  id: string;
  timestamp: number;
}

export interface Reference {
  content: string;
  reference: string;
}

export interface APIResponse {
  response: string;
  context?: string;
  retrievedVerses?: Reference[];
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "indexing" | "indexed" | "error";
  pages?: number;
  error?: string;
  url?: string;
  progress?: number; // Added progress field for tracking upload/indexing progress
}

export interface GenerateRequest {
  messages: Message[];
  top_searches?: number;
  model?: string;
  max_tokens?: number;
}
