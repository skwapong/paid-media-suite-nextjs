import type { ChatHistoryResponse, ChatHistoryParams } from '../types/chat'

// Get configuration based on environment (production vs development)
const isProduction = process.env.NODE_ENV === 'production'
const API_KEY = process.env.NEXT_PUBLIC_TD_API_KEY || ''
const BASE_URL = isProduction ? '' : (process.env.NEXT_PUBLIC_TD_LLM_BASE_URL || '')

export class ChatHistoryService {
  /**
   * Fetch chat history from the API
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with chat history data
   */
  static async getChatHistory(params: ChatHistoryParams = {}): Promise<ChatHistoryResponse> {
    const {
      agentId,
      limit = 20,
      offset = 0,
      sort = '-id'
    } = params

    // Build query string
    const queryParams = new URLSearchParams({
      'page[limit]': limit.toString(),
      'page[offset]': offset.toString(),
      sort
    })

    if (agentId) {
      queryParams.append('filter[agentId]', agentId)
    }

    // Build headers - in production, don't send Authorization (proxy adds it)
    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    }

    // Only add Authorization in development (proxy forwards it)
    if (!isProduction && API_KEY) {
      headers['Authorization'] = `TD1 ${API_KEY}`
    }

    try {
      const response = await fetch(`${BASE_URL}/api/chats?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status} ${response.statusText}`)
      }

      const data: ChatHistoryResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching chat history:', error)
      throw error
    }
  }

  /**
   * Get chat history for a specific agent
   * @param agentId - The agent ID to filter by
   * @param limit - Number of items to fetch
   * @param offset - Offset for pagination
   * @returns Promise with filtered chat history
   */
  static async getAgentChatHistory(
    agentId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ChatHistoryResponse> {
    return this.getChatHistory({ agentId, limit, offset })
  }

  /**
   * Get detailed chat history for a specific chat ID
   * This includes all messages, tool calls, and responses
   * @param chatId - The unique chat session ID
   * @returns Promise with full chat history data
   */
  static async getChatHistoryDetails(chatId: string): Promise<any> {
    // Build headers - in production, don't send Authorization (proxy adds it)
    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    }

    // Only add Authorization in development (proxy forwards it)
    if (!isProduction && API_KEY) {
      headers['Authorization'] = `TD1 ${API_KEY}`
    }

    try {
      const response = await fetch(`${BASE_URL}/api/chats/${chatId}/history`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch chat history details: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching chat history details:', error)
      throw error
    }
  }

  /**
   * Parse client input from the full firstInputContent string
   * The firstInputContent contains the full system prompt + "Client Input:" section
   * @param firstInputContent - The full content string from the API
   * @returns The extracted client input or fallback to full content
   */
  static parseClientInput(firstInputContent: string): string {
    if (!firstInputContent) return 'New conversation'

    // Match everything after "Client Input:\n" until double newline or end
    const clientInputMatch = firstInputContent.match(/Client Input:\n(.*?)(?:\n\n|$)/s)

    if (clientInputMatch && clientInputMatch[1]) {
      return clientInputMatch[1].trim()
    }

    // Fallback: if no "Client Input:" section found, return first 100 chars
    return firstInputContent.substring(0, 100).trim() + (firstInputContent.length > 100 ? '...' : '')
  }
}
