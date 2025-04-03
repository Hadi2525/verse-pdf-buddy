
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
  pages?: number;
  status: "uploading" | "indexing" | "indexed" | "error";
  error?: string;
  startPage?: number;
  endPage?: number;
}

export interface GenerateRequest {
  messages: Message[];
  top_searches?: number;
  model?: string;
  max_tokens?: number;
}
