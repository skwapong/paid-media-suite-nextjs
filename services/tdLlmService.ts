interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AgentResponse {
  id: string
  content: string
  agentId: string
  timestamp: string
}

interface TDLLMConfig {
  apiKey?: string
  baseUrl?: string
  orchestratorAgentId?: string
}

interface FileAttachment {
  binaryBase64: string        // Base64 encoded file content
  contentType: string         // MIME type of the file
  fileName: string            // Name of the uploaded file
  attachmentType: 'image' | 'document'  // Type of attachment
  inputFieldName?: string     // Optional input field name (for images)
}

interface StreamEvent {
  content?: string
  tool_call?: {
    id: string
    functionName: string
    functionArguments: string
  }
  tool_response?: {
    id: string
    content: any
    metadata?: any
  }
  error?: string
  streamingError?: boolean
  status?: number
  isRetrying?: boolean
}

class TDLLMService {
  private baseUrl: string
  private apiKey: string
  private orchestratorAgentId: string
  private currentChatId: string | null = null
  private currentAbortController: AbortController | null = null

  constructor(config?: TDLLMConfig) {
    // In production: use Vercel serverless functions
    // In development: use Vite proxy for CORS
    const isProduction = process.env.NODE_ENV === "production"

    if (isProduction) {
      // Production: empty baseUrl means same-origin /api requests (Vercel functions)
      this.baseUrl = ''
      console.log('🚀 Running in production mode - using Vercel serverless functions')
    } else {
      // Development: use Vite proxy (empty baseUrl triggers /api prefix)
      this.baseUrl = config?.baseUrl || process.env.NEXT_PUBLIC_TD_LLM_BASE_URL || ''
      console.log('🔧 Running in development mode - using Vite proxy')
    }

    this.apiKey = '' // Not needed client-side - handled by serverless functions
    this.orchestratorAgentId = config?.orchestratorAgentId || ''

    if (!this.orchestratorAgentId) {
      console.warn('Missing orchestrator agent ID')
    }
  }

  private buildHeaders(stream = false): Record<string, string> {
    // Client headers - no Authorization needed (handled by serverless function)
    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.api+json'
    }

    if (stream) {
      headers['Accept'] = 'text/event-stream'
    }

    return headers
  }

  async createChatSession(): Promise<string> {
    try {
      const payload = {
        data: {
          type: 'chats',
          attributes: {
            agentId: this.orchestratorAgentId
          }
        }
      }

      console.log('🔍 Creating chat session with payload:', {
        agentId: this.orchestratorAgentId,
        baseUrl: this.baseUrl,
        hasApiKey: !!this.apiKey,
        body: JSON.stringify(payload)
      })

      const response = await fetch(`${this.baseUrl}/api/chats`, {
        method: 'POST',
        headers: this.buildHeaders(false),
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        let errorDetails
        try {
          errorDetails = await response.json()
        } catch (e) {
          errorDetails = await response.text()
        }
        console.error('❌ Chat session creation failed:', {
          status: response.status,
          statusText: response.statusText,
          errorDetails
        })
        throw new Error(`Failed to create chat session: ${response.status} - ${JSON.stringify(errorDetails)}`)
      }

      const result = await response.json()
      this.currentChatId = result.data.id
      console.log('✅ Chat session created:', this.currentChatId)

      return this.currentChatId as string
    } catch (error) {
      console.error('Failed to create chat session:', error)
      throw error
    }
  }

  setCurrentChatId(chatId: string): void {
    this.currentChatId = chatId
  }

  getCurrentChatId(): string | null {
    return this.currentChatId
  }

  async *continueChatStream(userMessage: string, attachments?: FileAttachment[]): AsyncGenerator<StreamEvent, void, unknown> {
    if (!this.currentChatId) {
      throw new Error('No active chat session')
    }

    this.currentAbortController = new AbortController()

    try {
      const payload: any = {
        input: userMessage
      }

      // Add attachments if provided
      if (attachments && attachments.length > 0) {
        payload.attachments = attachments.map(attachment => ({
          binaryBase64: attachment.binaryBase64,
          contentType: attachment.contentType,
          fileName: attachment.fileName,
          attachmentType: attachment.attachmentType,
          ...(attachment.inputFieldName && { inputFieldName: attachment.inputFieldName })
        }))
        console.log('🔍 Payload with attachments:', {
          hasAttachments: true,
          attachmentCount: payload.attachments.length,
          attachments: payload.attachments.map((a: any) => ({
            fileName: a.fileName,
            contentType: a.contentType,
            attachmentType: a.attachmentType,
            base64Length: a.binaryBase64?.length || 0
          }))
        })
      } else {
        console.log('🔍 Payload without attachments')
      }

      // Log the complete payload for debugging
      console.log('🔍 Complete payload being sent:', JSON.stringify(payload, null, 2).substring(0, 500))

      const response = await fetch(`${this.baseUrl}/api/chats/${this.currentChatId}/continue`, {
        method: 'POST',
        headers: this.buildHeaders(true),
        body: JSON.stringify(payload),
        signal: this.currentAbortController.signal
      })

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No stream reader available')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })

        while (buffer.includes('\n')) {
          const line = buffer.slice(0, buffer.indexOf('\n')).trim()
          buffer = buffer.slice(buffer.indexOf('\n') + 1)

          if (line.startsWith('data:')) {
            const eventData = line.slice(5).trim()

            if (eventData && eventData !== '[DONE]') {
              try {
                const eventJson = JSON.parse(eventData)

                // Handle errors
                if (eventJson.error) {
                  yield {
                    error: eventJson.error,
                    streamingError: true
                  }
                  return
                }

                // Handle HTTP status errors
                if (eventJson.status) {
                  const statusCode = typeof eventJson.status === 'string'
                    ? parseInt(eventJson.status, 10)
                    : eventJson.status
                  if (!isNaN(statusCode) && (statusCode >= 400 || statusCode < 200)) {
                    yield {
                      error: eventJson.error || eventJson.message || `API Error: Status ${statusCode}`,
                      streamingError: true,
                      status: statusCode
                    }
                    return
                  }
                }

                // Handle content chunks
                if (eventJson.content) {
                  yield { content: eventJson.content }
                }

                // Handle tool calls
                if (eventJson.tool_call) {
                  console.log('🔧 TDLLMService: Yielding tool_call:', eventJson.tool_call)
                  yield { tool_call: eventJson.tool_call }
                }

                // Handle tool responses
                if (eventJson.tool) {
                  console.log('📦 TDLLMService: Yielding tool response:', eventJson.tool)
                  yield { tool_response: eventJson.tool }
                }

                // Log the entire event for debugging
                console.log('📡 Stream event:', eventJson)
              } catch (e) {
                console.warn('Failed to parse stream data:', eventData)
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        yield { error: 'Request cancelled', streamingError: true }
      } else {
        yield {
          error: error instanceof Error ? error.message : 'Unknown error',
          streamingError: true
        }
      }
    }
  }

  abortCurrentRequest(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort()
      this.currentAbortController = null
    }
  }

  resetChatSession(): void {
    this.currentChatId = null
    this.abortCurrentRequest()
  }

  // Get chat history with tool calls
  async getChatHistory(chatId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chats/${chatId}/history`, {
        method: 'GET',
        headers: this.buildHeaders(false)
      })

      if (!response.ok) {
        throw new Error(`Failed to get chat history: ${response.status}`)
      }

      const result = await response.json()
      console.log('📚 Chat history fetched:', result)
      return result
    } catch (error) {
      console.error('Failed to get chat history:', error)
      throw error
    }
  }

  // Legacy method for backwards compatibility
  async sendMessage(
    agentId: string,
    message: string,
    conversationHistory: AgentMessage[] = []
  ): Promise<AgentResponse> {
    console.warn('sendMessage is deprecated, use continueChatStream instead')
    return {
      id: crypto.randomUUID(),
      content: `Mock response for: ${message}`,
      agentId,
      timestamp: new Date().toISOString(),
    }
  }

  async getAgentInfo(agentId: string) {
    try {
      return null
    } catch (error) {
      console.error('Error getting agent info:', error)
      return null
    }
  }
}

export default TDLLMService
export const tdLlmService = new TDLLMService()
export type { AgentMessage, AgentResponse, StreamEvent, TDLLMConfig, FileAttachment }
