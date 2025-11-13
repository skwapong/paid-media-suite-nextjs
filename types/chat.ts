export interface ChatHistoryItem {
  id: string
  type: 'chats'
  attributes: {
    createdAt: string
    updatedAt: string
    firstInputContent: string
    lastConversationAt: string
    agentId?: string
    agentName?: string
  }
}

export interface ChatHistoryResponse {
  data: ChatHistoryItem[]
  meta?: {
    pagination?: {
      total: number
      count: number
      offset: number
      limit: number
    }
  }
}

export interface ChatHistoryParams {
  agentId?: string
  limit?: number
  offset?: number
  sort?: string
}
