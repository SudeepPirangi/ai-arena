export interface SourceCitation {
  sourceFile: string;
  pageNumber?: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  isStreaming?: boolean;
}