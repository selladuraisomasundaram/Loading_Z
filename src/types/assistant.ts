export interface ToolStep {
  step: string;
  action: string;
  result?: string;
}

export interface WebSearchPayload {
  query: string;
  sources: string[];
  summary: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  toolActivity?: ToolStep[];
  targetAisle?: string;
  targetProductId?: string;
  webSearchUsed?: boolean;
  webSearchResults?: WebSearchPayload;
}
