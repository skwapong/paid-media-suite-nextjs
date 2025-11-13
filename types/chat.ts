export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface TDChatResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      agentId: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface StreamChunk {
  user_content?: string;
  content?: string;
  tool_call?: {
    id: string;
    functionName: string;
    functionArguments: string;
    targetAgent?: {
      id: string;
      name: string;
    };
  };
  tool?: {
    id: string;
    content: string;
    status: string;
  };
  at: string;
}
