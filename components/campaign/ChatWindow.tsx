import { css } from '@emotion/react'
import { useState, useEffect, useRef } from 'react'
import TDLLMService, { type FileAttachment as TDFileAttachment } from '../../services/tdLlmService'
import FileUpload, { FileAttachment } from '../chat/FileUpload'
import { type UploadedFile, cleanupFileUrls } from '../../utils/fileUpload'
import ToolResponseRenderer from '../chat/ToolResponseRenderer'
import MessageExportMenu from '../chat/MessageExportMenu'
import MessageActions from '../chat/MessageActions'
import ExportMenu from '../chat/ExportMenu'

// Helper function to count tokens (rough estimate: ~4 characters per token)
const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4)
}

interface ToolCall {
  id?: string
  function_name?: string
  function_arguments?: string | any
  output?: any
  status?: string
}

interface Message {
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  activities?: string[]
  isThinking?: boolean
  attachments?: UploadedFile[]  // Store file attachments with messages
  toolCalls?: ToolCall[]  // Tool calls made during message processing
}

// Format message content with proper styling
const formatMessageContent = (content: string) => {
  const lines = content.split('\n')
  const formatted: JSX.Element[] = []
  let listItems: JSX.Element[] = []
  let currentListType: 'numbered' | 'bullet' | null = null

  const processBoldText = (text: string) => {
    const parts = text.split(/(\*\*.+?\*\*)/)
    return parts.map((part, i) => {
      if (part.match(/\*\*(.+?)\*\*/)) {
        const boldText = part.replace(/\*\*/g, '')
        return (
          <strong key={i} css={css`
            font-weight: 700;
            color: #111827;
          `}>
            {boldText}
          </strong>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  const flushList = () => {
    if (listItems.length > 0) {
      if (currentListType === 'numbered') {
        formatted.push(
          <ol key={formatted.length} css={css`
            margin: 16px 0;
            padding-left: 32px;
            list-style-type: decimal;
            counter-reset: item;

            li {
              margin-bottom: 12px;
              line-height: 1.7;
              color: #374151;
              position: relative;

              &::marker {
                color: #1957DB;
                font-weight: 700;
                font-size: 15px;
              }

              &:last-child {
                margin-bottom: 0;
              }
            }
          `}>
            {listItems}
          </ol>
        )
      } else {
        formatted.push(
          <ul key={formatted.length} css={css`
            margin: 12px 0;
            padding-left: 32px;
            list-style-type: none;

            li {
              margin-bottom: 10px;
              line-height: 1.7;
              color: #374151;
              position: relative;

              &::before {
                content: '•';
                color: #1957DB;
                font-weight: bold;
                font-size: 18px;
                position: absolute;
                left: -20px;
              }

              &:last-child {
                margin-bottom: 0;
              }
            }
          `}>
            {listItems}
          </ul>
        )
      }
      listItems = []
      currentListType = null
    }
  }

  lines.forEach((line, index) => {
    // Check for numbered list (1. 2. etc.)
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/)
    if (numberedMatch) {
      if (currentListType !== 'numbered') {
        flushList()
        currentListType = 'numbered'
      }
      listItems.push(<li key={`line-${index}-${line.substring(0, 20)}`}>{processBoldText(numberedMatch[2])}</li>)
      return
    }

    // Check for bullet list (- starting)
    const bulletMatch = line.match(/^\s*-\s+(.+)$/)
    if (bulletMatch) {
      if (currentListType !== 'bullet') {
        flushList()
        currentListType = 'bullet'
      }
      listItems.push(<li key={`line-${index}-${line.substring(0, 20)}`}>{processBoldText(bulletMatch[1])}</li>)
      return
    }

    // Not a list item, flush any pending list
    flushList()

    // Check for headings (## or **) and remove the ## markers
    const headingMatch = line.match(/^##\s*\*\*(.+?)\*\*\s*$/)
    if (headingMatch) {
      // Heading with ** markers - just render as bold heading
      formatted.push(
        <div key={`line-${index}-${line.substring(0, 20)}`} css={css`
          font-weight: 700;
          font-size: 15px;
          color: #111827;
          margin: 20px 0 12px 0;
          letter-spacing: -0.01em;

          &:first-of-type {
            margin-top: 4px;
          }
        `}>
          {headingMatch[1]}
        </div>
      )
      return
    }

    // Plain ## heading
    const plainHeadingMatch = line.match(/^##\s+(.+)$/)
    if (plainHeadingMatch) {
      formatted.push(
        <div key={`line-${index}-${line.substring(0, 20)}`} css={css`
          font-weight: 700;
          font-size: 15px;
          color: #111827;
          margin: 20px 0 12px 0;
          letter-spacing: -0.01em;

          &:first-of-type {
            margin-top: 4px;
          }
        `}>
          {processBoldText(plainHeadingMatch[1])}
        </div>
      )
      return
    }

    // Check for lines starting with # and remove them
    const hashMatch = line.match(/^#+\s+(.+)$/)
    if (hashMatch) {
      formatted.push(
        <div key={`line-${index}-${line.substring(0, 20)}`} css={css`
          font-weight: 700;
          font-size: 15px;
          color: #111827;
          margin: 20px 0 12px 0;
          letter-spacing: -0.01em;

          &:first-of-type {
            margin-top: 4px;
          }
        `}>
          {processBoldText(hashMatch[1])}
        </div>
      )
      return
    }

    // Check for separator (---)
    if (line.trim() === '---') {
      formatted.push(
        <hr key={`line-${index}-separator`} css={css`
          border: none;
          border-top: 1px solid #E5E7EB;
          margin: 20px 0;
        `} />
      )
      return
    }

    // Regular paragraph or text with bold
    if (line.trim()) {
      const hasBold = line.match(/\*\*(.+?)\*\*/g)
      formatted.push(
        <div key={`line-${index}-${line.substring(0, 20)}`} css={css`
          margin-bottom: 12px;
          color: #374151;
          line-height: 1.7;

          &:last-child {
            margin-bottom: 0;
          }
        `}>
          {hasBold ? processBoldText(line) : line}
        </div>
      )
    } else {
      // Empty line for spacing
      formatted.push(<div key={`line-${index}-empty`} css={css`height: 12px;`} />)
    }
  })

  // Flush any remaining list
  flushList()

  return <>{formatted}</>
}

interface ChatWindowProps {
  message: string
  setMessage: (message: string) => void
  chatHistory?: Message[]
  onChatHistoryChange?: (messages: Message[]) => void
  isLeftNavExpanded?: boolean
  onBack?: () => void  // Callback for back button
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  message,
  setMessage,
  chatHistory = [],
  onChatHistoryChange,
  isLeftNavExpanded = false,
  onBack
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>(chatHistory)
  const [isInitialized, setIsInitialized] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const tdServiceRef = useRef<TDLLMService | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Update messages when chatHistory prop changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      setMessages(chatHistory)
    } else if (chatHistory.length === 0 && messages.length > 0) {
      // Chat was cleared, reset the session
      setMessages([])
      if (tdServiceRef.current) {
        console.log('Resetting chat session for new conversation')
        tdServiceRef.current = new TDLLMService()
      }
    }
  }, [chatHistory, messages.length])

  // Initialize TD service with hardcoded agent
  useEffect(() => {
    if (!isInitialized) {
      console.log('Initializing TD service with hardcoded agent')
      tdServiceRef.current = new TDLLMService()
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:mime/type;base64, prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  const handleStop = () => {
    if (tdServiceRef.current) {
      console.log('🛑 Stopping current request...')
      tdServiceRef.current.abortCurrentRequest()
      setIsLoading(false)
    }
  }

  const handleExitConfirm = () => {
    console.log('🔙 Exit chat confirmed - navigating back to hub')

    // Close modal first
    setShowExitConfirm(false)

    // Clear local messages state
    setMessages([])

    // Notify parent to clear chat history
    onChatHistoryChange?.([])

    // Clear uploaded files
    setUploadedFiles([])

    // Navigate back to hub
    if (onBack) {
      console.log('🔙 Calling onBack callback')
      onBack()
    } else {
      console.warn('⚠️ onBack callback not provided')
    }
  }

  const handleExitCancel = () => {
    setShowExitConfirm(false)
  }

  const handleSubmit = async () => {
    if (!message.trim() || !tdServiceRef.current) return

    // Capture uploaded files at the start (before any async operations)
    const filesToSend = [...uploadedFiles]
    console.log('📎 Files to send:', filesToSend.length)

    // Add initial greeting if this is the first message
    let updatedMessages = messages
    if (messages.length === 0) {
      const greetingMessage: Message = {
        type: 'assistant',
        content: 'GREETING',
        timestamp: new Date()
      }
      updatedMessages = [greetingMessage]
      setMessages(updatedMessages)
      onChatHistoryChange?.(updatedMessages)
    }

    // Add user message to chat
    const userMessage: Message = {
      type: 'user',
      content: message.trim(),
      timestamp: new Date(),
      attachments: filesToSend.length > 0 ? filesToSend : undefined
    }

    updatedMessages = [...updatedMessages, userMessage]
    setMessages(updatedMessages)
    onChatHistoryChange?.(updatedMessages)

    setIsLoading(true)
    const currentMessage = message
    setMessage('')

    // Simulate activity updates - show specific knowledge base access
    const activities = [
      'Analyzing your request and identifying key requirements...',
      'Accessing knowledge base: platform_best_practices',
      'Retrieving data from: audience_insights_genz',
      'Consulting knowledge base: budget_optimization_strategies',
      'Reviewing platform data: meta_advertising_guidelines',
      'Analyzing: tiktok_campaign_best_practices',
      'Cross-referencing: google_ads_targeting_options',
      'Synthesizing insights and generating recommendations...',
      'Finalizing campaign strategy and formatting response...'
    ]

    // Add thinking message with first activity already populated
    const thinkingMessage: Message = {
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isThinking: true,
      activities: [activities[0]] // Start with first activity
    }
    const messagesWithThinking = [...updatedMessages, thinkingMessage]
    console.log('Setting thinking message:', thinkingMessage)
    console.log('Messages with thinking:', messagesWithThinking)
    setMessages(messagesWithThinking)

    // Track when thinking indicator started for minimum display time
    const thinkingStartTime = Date.now()

    // Wait to ensure the thinking UI renders
    await new Promise(resolve => setTimeout(resolve, 200))
    console.log('Starting activity interval...')

    let activityIndex = 1 // Start from second activity
    const thinkingMessageIndex = messagesWithThinking.length - 1
    const activityInterval = setInterval(() => {
      if (activityIndex < activities.length) {
        setMessages(currentMessages => {
          const updatedMessages = [...currentMessages]
          const thinkingMsg = updatedMessages[thinkingMessageIndex]
          if (thinkingMsg && thinkingMsg.isThinking) {
            updatedMessages[thinkingMessageIndex] = {
              ...thinkingMsg,
              activities: [...(thinkingMsg.activities || []), activities[activityIndex]]
            }
          }
          return updatedMessages
        })
        activityIndex++
      }
    }, 50)

    // Wait for most activities to show before starting API call
    await new Promise(resolve => setTimeout(resolve, 600))

    try {
      // Create chat session if not exists
      if (!tdServiceRef.current.getCurrentChatId()) {
        await tdServiceRef.current.createChatSession()
      }

      // Convert uploaded files to base64 for API
      const attachments: TDFileAttachment[] = []
      if (filesToSend.length > 0) {
        console.log('Processing file attachments:', filesToSend.length)
        for (const uploadedFile of filesToSend) {
          try {
            const base64Data = await fileToBase64(uploadedFile.file)

            // Determine attachment type based on MIME type
            const isImage = uploadedFile.file.type.startsWith('image/')
            const attachmentType = isImage ? 'image' : 'document'

            const attachment: TDFileAttachment = {
              binaryBase64: base64Data,
              contentType: uploadedFile.file.type,
              fileName: uploadedFile.file.name,
              attachmentType: attachmentType
            }

            // Add inputFieldName for images
            if (isImage) {
              attachment.inputFieldName = `image_${Date.now()}_${filesToSend.indexOf(uploadedFile)}`
            }

            attachments.push(attachment)
          } catch (error) {
            console.error('Error converting file to base64:', error)
          }
        }
        console.log('Converted attachments:', attachments.length)
      }

      console.log('Streaming message to orchestrator:', currentMessage)
      if (attachments.length > 0) {
        console.log('Including attachments:', attachments.map(a => a.fileName))
      }

      let fullResponse = ''
      const toolCalls: ToolCall[] = []
      const toolCallMap = new Map<string, ToolCall>()

      // Stream the response with attachments
      for await (const chunk of tdServiceRef.current.continueChatStream(currentMessage, attachments)) {
        if (chunk.content) {
          fullResponse += chunk.content
        }

        // Capture tool calls
        if (chunk.tool_call) {
          console.log('🔧 Tool call detected:', chunk.tool_call)
          const toolCall: ToolCall = {
            id: chunk.tool_call.id,
            function_name: chunk.tool_call.functionName,
            function_arguments: chunk.tool_call.functionArguments,
            status: 'PENDING'
          }
          toolCallMap.set(chunk.tool_call.id, toolCall)
        }

        // Capture tool responses
        if (chunk.tool_response) {
          console.log('📦 Tool response detected:', chunk.tool_response)
          const existingToolCall = toolCallMap.get(chunk.tool_response.id)
          if (existingToolCall) {
            existingToolCall.output = chunk.tool_response.content
            existingToolCall.status = chunk.tool_response.metadata?.status || 'SUCCESS'
          }
        }

        if (chunk.error) {
          console.error('Stream error:', chunk.error)
          fullResponse = fullResponse || `Error: ${chunk.error}`
          break
        }
      }

      // Convert tool call map to array
      toolCallMap.forEach(toolCall => {
        toolCalls.push(toolCall)
      })

      console.log('✅ Captured tool calls from stream:', toolCalls.length, toolCalls)

      // Fetch chat history to get tool calls (they're not in the streaming response)
      try {
        const chatId = tdServiceRef.current.getCurrentChatId()
        if (chatId) {
          console.log('📚 Fetching chat history for tool calls...')
          const history = await tdServiceRef.current.getChatHistory(chatId)

          // Extract tool calls from the latest exchange
          if (history?.data?.attributes?.conversationHistory) {
            const conversationHistory = history.data.attributes.conversationHistory
            console.log('📚 Conversation history:', conversationHistory)

            // Find the last assistant message in history
            const lastExchange = conversationHistory[conversationHistory.length - 1]
            if (lastExchange?.tool_calls && Array.isArray(lastExchange.tool_calls)) {
              console.log('🔧 Found tool calls in history:', lastExchange.tool_calls.length)

              // Map tool calls to our format
              lastExchange.tool_calls.forEach((tc: any) => {
                const toolCall: ToolCall = {
                  id: tc.id,
                  function_name: tc.function_name,
                  function_arguments: tc.function_arguments,
                  output: tc.content || tc.output,
                  status: tc.status || 'SUCCESS'
                }
                toolCalls.push(toolCall)
              })
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch chat history for tool calls:', error)
      }

      console.log('✅ Final tool calls:', toolCalls.length, toolCalls)

      // Clear activity interval
      clearInterval(activityInterval)

      // Calculate how long the thinking indicator has been shown
      const thinkingElapsedTime = Date.now() - thinkingStartTime
      const minDisplayTime = 1500 // Minimum 1.5 seconds to see thinking state
      const remainingTime = Math.max(0, minDisplayTime - thinkingElapsedTime)

      console.log(`Thinking displayed for ${thinkingElapsedTime}ms, waiting ${remainingTime}ms more before showing response`)

      // Wait for the remaining time to ensure thinking indicator is visible
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }

      // Replace thinking message with assistant response
      const assistantMessage: Message = {
        type: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined
      }

      setMessages(currentMessages => {
        const finalMessages = [...currentMessages]
        // Replace the thinking message with the actual response
        if (finalMessages[thinkingMessageIndex] && finalMessages[thinkingMessageIndex].isThinking) {
          finalMessages[thinkingMessageIndex] = assistantMessage
        }
        return finalMessages
      })

      // Update parent component
      onChatHistoryChange?.([...updatedMessages, assistantMessage])

      // Clear uploaded files after successful send
      if (filesToSend.length > 0) {
        cleanupFileUrls(filesToSend)
        setUploadedFiles([])
        console.log('Cleared uploaded files')
      }

      console.log('Stream complete')
    } catch (error) {
      console.error('Error sending message:', error)
      clearInterval(activityInterval)

      const errorMessage: Message = {
        type: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      }

      setMessages(currentMessages => {
        const finalMessages = [...currentMessages]
        // Replace the thinking message with the error message
        if (finalMessages[thinkingMessageIndex] && finalMessages[thinkingMessageIndex].isThinking) {
          finalMessages[thinkingMessageIndex] = errorMessage
        }
        return finalMessages
      })

      onChatHistoryChange?.([...updatedMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Scroll to top of messages
  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Export chat as Markdown
  const handleExportChat = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    let markdown = `# Campaign Builder Chat Export\n\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n`

    messages.forEach((msg, index) => {
      const role = msg.type === 'user' ? 'You' : 'Campaign Strategist'
      const time = msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

      markdown += `## ${role} (${time})\n\n${msg.content}\n\n---\n\n`
    })

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campaign-chat-${timestamp}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setShowMenu(false)
  }

  // Calculate chat statistics
  const calculateStats = () => {
    const userMessages = messages.filter(m => m.type === 'user').length
    const assistantMessages = messages.filter(m => m.type === 'assistant' && m.content !== 'GREETING').length

    // Calculate tokens for input (user messages) and output (assistant messages)
    let inputTokens = 0
    let outputTokens = 0

    messages.forEach(msg => {
      if (msg.content !== 'GREETING') {
        const tokens = estimateTokens(msg.content)
        if (msg.type === 'user') {
          inputTokens += tokens
        } else if (msg.type === 'assistant') {
          outputTokens += tokens
        }
      }
    })

    const totalTokens = inputTokens + outputTokens

    // Pricing based on Claude 3.5 Sonnet (new) rates
    // Input: $3 per million tokens ($0.003 per 1K tokens)
    // Output: $15 per million tokens ($0.015 per 1K tokens)
    const inputCost = (inputTokens / 1000) * 0.003
    const outputCost = (outputTokens / 1000) * 0.015
    const totalCost = inputCost + outputCost

    const firstMessage = messages[0]?.timestamp
    const lastMessage = messages[messages.length - 1]?.timestamp
    const duration = firstMessage && lastMessage
      ? Math.floor((lastMessage.getTime() - firstMessage.getTime()) / 1000 / 60)
      : 0

    return {
      userMessages,
      assistantMessages,
      totalMessages: userMessages + assistantMessages,
      estimatedTokens: totalTokens,
      inputTokens,
      outputTokens,
      estimatedCost: totalCost,
      duration
    }
  }

  // Full canvas chat view when conversation is active
  if (messages.length > 0) {
    return (
      <div css={css`
        position: fixed;
        left: ${isLeftNavExpanded ? '240px' : '64px'};
        top: 0;
        right: 0;
        bottom: 0;
        background-color: #F5F7FA;
        display: flex;
        flex-direction: column;
        z-index: 100;
        transition: left 0.3s ease-in-out;
      `}>
        {/* Header */}
        <header css={css`
          background-color: #ffffff;
          border-bottom: 1px solid #DCE1EA;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        `}>
          <button
            onClick={() => {
              if (messages.length > 0) {
                if (window.confirm('Are you sure you want to exit this chat? Your conversation will be saved in chat history.')) {
                  if (onBack) {
                    onBack()
                  }
                }
              } else if (onBack) {
                onBack()
              }
            }}
            css={css`
              background: none;
              border: none;
              cursor: pointer;
              padding: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              transition: background-color 0.2s;
              &:hover {
                background-color: #F9FBFF;
              }
            `}
          >
            <BackArrowIcon />
          </button>
          <AgentIconSquare />
          <h1 css={css`
            font-family: 'Figtree', sans-serif;
            font-weight: 600;
            font-size: 18px;
            color: #000000;
            margin: 0;
            flex: 1;
          `}>
            Campaign Builder
          </h1>
        </header>

        {/* Messages Area */}
        <div css={css`
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        `}>
          {messages.map((msg, index) => {
            // Special rendering for greeting message
            if (msg.content === 'GREETING' && msg.type === 'assistant') {
              return (
                <div
                  key={`msg-${msg.timestamp.getTime()}-${index}`}
                  css={css`
                    display: flex;
                    justify-content: flex-start;
                    max-width: 100%;
                  `}
                >
                  <div css={css`
                    max-width: 100%;
                    background-color: transparent;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                  `}>
                    {/* Greeting Text */}
                    <div css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #212327;
                      line-height: 1.6;
                    `}>
                      Hi! I'm your <strong css={css`color: #1957DB;`}>Campaign Builder AI Assistant</strong>. Tell me about your campaign goals, budget, target audience, and timeline - just like you're briefing a team member.
                    </div>

                    {/* Example Box */}
                    <div css={css`
                      background-color: #F9FAFB;
                      border: 1px solid #E5E7EB;
                      border-radius: 8px;
                      padding: 16px;
                    `}>
                      <div css={css`
                        font-family: 'Figtree', sans-serif;
                        font-size: 13px;
                        font-weight: 600;
                        color: #374151;
                        margin-bottom: 12px;
                      `}>
                        Example
                      </div>
                      <div css={css`
                        font-family: 'Figtree', sans-serif;
                        font-size: 13px;
                        color: #4B5563;
                        line-height: 1.6;
                        font-style: italic;
                      `}>
                        "I need to launch a holiday campaign for our new smartwatch. We're targeting tech-savvy millennials aged 25-40 who are interested in fitness and productivity. Our budget is $75K over 6 weeks, starting Black Friday through New Year's. Main goal is driving online sales with a target ROAS of 4x. We want to focus on Google Ads and Meta platforms, with video creative showcasing the health tracking features."
                      </div>
                    </div>

                    {/* Pro Tip */}
                    <div css={css`
                      display: flex;
                      gap: 8px;
                      align-items: flex-start;
                    `}>
                      <div css={css`
                        color: #F59E0B;
                        font-size: 16px;
                        line-height: 1;
                        margin-top: 2px;
                      `}>
                        💡
                      </div>
                      <div css={css`
                        font-family: 'Figtree', sans-serif;
                        font-size: 13px;
                        color: #6B7280;
                        line-height: 1.6;
                      `}>
                        <strong>Pro Tip:</strong> The more details you provide, the more tailored and actionable your campaign strategy will be!
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            // Thinking indicator with activities
            if (msg.isThinking && msg.type === 'assistant') {
              console.log('Rendering thinking indicator:', msg)
              return (
                <div
                  key={`msg-${msg.timestamp.getTime()}-${index}`}
                  css={css`
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;
                  `}
                >
                  {/* Message Label */}
                  <div css={css`
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 4px;
                  `}>
                    <div css={css`
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    `}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" fill="white"/>
                      </svg>
                    </div>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-weight: 600;
                      font-size: 13px;
                      color: #6F2EFF;
                    `}>
                      Campaign Strategist & Planner
                    </span>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 11px;
                      color: #9CA3AF;
                    `}>
                      {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Thinking Bubble */}
                  <div css={css`
                    max-width: 70%;
                    background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
                    border: 1px solid #BAE6FD;
                    border-radius: 12px;
                    padding: 16px 20px;
                    box-shadow: 0px 2px 4px rgba(25, 87, 219, 0.1);
                  `}>
                    {/* Thinking header - Enhanced and more prominent */}
                    <div css={css`
                      display: flex;
                      align-items: center;
                      gap: 12px;
                      margin-bottom: ${msg.activities && msg.activities.length > 0 ? '18px' : '4px'};
                      padding: 12px 16px;
                      background: linear-gradient(135deg, rgba(25, 87, 219, 0.08) 0%, rgba(111, 46, 255, 0.08) 100%);
                      border-radius: 8px;
                      border: 1px solid rgba(25, 87, 219, 0.2);
                    `}>
                      {/* Larger animated spinner */}
                      <div css={css`
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      `}>
                        <div css={css`
                          width: 32px;
                          height: 32px;
                          border: 3px solid #E0F2FE;
                          border-top-color: #1957DB;
                          border-radius: 50%;
                          animation: spin 0.8s linear infinite;
                          @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                        `} />
                      </div>
                      <div css={css`
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                      `}>
                        <span css={css`
                          font-family: 'Figtree', sans-serif;
                          font-size: 15px;
                          font-weight: 700;
                          color: #1957DB;
                          letter-spacing: -0.01em;
                        `}>
                          AI is thinking...
                        </span>
                        <span css={css`
                          font-family: 'Figtree', sans-serif;
                          font-size: 12px;
                          font-weight: 500;
                          color: #64748B;
                        `}>
                          Analyzing your request and generating a response
                        </span>
                      </div>
                      {/* Pulsing dots */}
                      <div css={css`
                        display: flex;
                        gap: 4px;
                      `}>
                        <div css={css`
                          width: 6px;
                          height: 6px;
                          border-radius: 50%;
                          background-color: #1957DB;
                          animation: pulse 1.4s ease-in-out infinite;
                          @keyframes pulse {
                            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                            40% { opacity: 1; transform: scale(1); }
                          }
                        `} />
                        <div css={css`
                          width: 6px;
                          height: 6px;
                          border-radius: 50%;
                          background-color: #1957DB;
                          animation: pulse 1.4s ease-in-out 0.2s infinite;
                          @keyframes pulse {
                            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                            40% { opacity: 1; transform: scale(1); }
                          }
                        `} />
                        <div css={css`
                          width: 6px;
                          height: 6px;
                          border-radius: 50%;
                          background-color: #1957DB;
                          animation: pulse 1.4s ease-in-out 0.4s infinite;
                          @keyframes pulse {
                            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                            40% { opacity: 1; transform: scale(1); }
                          }
                        `} />
                      </div>
                    </div>

                    {/* Activities list */}
                    {msg.activities && msg.activities.length > 0 && (
                      <div css={css`
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                      `}>
                        {msg.activities.map((activity, actIndex) => {
                          // Determine if this is a knowledge base/resource access
                          const isKBAccess = activity.includes('knowledge base:') ||
                                           activity.includes('Accessing') ||
                                           activity.includes('Retrieving') ||
                                           activity.includes('Consulting') ||
                                           activity.includes('Reviewing') ||
                                           activity.includes('Analyzing:') ||
                                           activity.includes('Cross-referencing:')

                          // Extract the resource name if it's a KB access
                          const kbMatch = activity.match(/(?:knowledge base:|from:|data:|Analyzing:|Cross-referencing:)\s*(.+)/)
                          const resourceName = kbMatch ? kbMatch[1].trim() : activity

                          return (
                            <div
                              key={actIndex}
                              css={css`
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                padding: 12px 14px;
                                background-color: white;
                                border-radius: 8px;
                                border: 1px solid #E0F2FE;
                                cursor: ${isKBAccess ? 'pointer' : 'default'};
                                transition: all 0.2s;
                                animation: slideIn 0.3s ease-out;

                                &:hover {
                                  ${isKBAccess ? 'border-color: #BAE6FD; background-color: #F0F9FF;' : ''}
                                }

                                @keyframes slideIn {
                                  from {
                                    opacity: 0;
                                    transform: translateY(-10px);
                                  }
                                  to {
                                    opacity: 1;
                                    transform: translateY(0);
                                  }
                                }
                              `}
                            >
                              {isKBAccess ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" css={css`min-width: 14px; color: #0284C7;`}>
                                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : (
                                <div css={css`
                                  min-width: 18px;
                                  height: 18px;
                                  border-radius: 50%;
                                  background-color: #10B981;
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                `}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              )}
                              <div css={css`flex: 1;`}>
                                <span css={css`
                                  font-family: 'Figtree', sans-serif;
                                  font-size: 13px;
                                  color: ${isKBAccess ? '#0369A1' : '#374151'};
                                  line-height: 1.5;
                                  font-weight: ${isKBAccess ? '600' : '500'};
                                `}>
                                  {isKBAccess ? (
                                    <>
                                      {activity.split(/knowledge base:|from:|data:|Analyzing:|Cross-referencing:/)[0]}
                                      <span css={css`
                                        font-family: 'Monaco', 'Courier New', monospace;
                                        font-size: 12px;
                                        color: #0284C7;
                                        background-color: #F0F9FF;
                                        padding: 2px 6px;
                                        border-radius: 4px;
                                        margin-left: 6px;
                                      `}>
                                        {resourceName}
                                      </span>
                                    </>
                                  ) : activity}
                                </span>
                              </div>
                              <div css={css`
                                min-width: 18px;
                                height: 18px;
                                border-radius: 50%;
                                background-color: #10B981;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                              `}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            // Normal message rendering
            return (
              <div
                key={`msg-${msg.timestamp.getTime()}-${index}`}
                className="message-container"
                css={css`
                  display: flex;
                  flex-direction: column;
                  align-items: ${msg.type === 'user' ? 'flex-end' : 'flex-start'};
                  gap: 6px;
                `}
              >
                {/* Message Label */}
                <div css={css`
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 0 4px;
                `}>
                  <div css={css`
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: ${msg.type === 'user' ? '#E3F2FD' : 'linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%)'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  `}>
                    {msg.type === 'user' ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="6" cy="4" r="2" fill="#1957DB"/>
                        <path d="M3 10C3 8.34315 4.34315 7 6 7C7.65685 7 9 8.34315 9 10" stroke="#1957DB" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" fill="white"/>
                      </svg>
                    )}
                  </div>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-weight: 600;
                    font-size: 13px;
                    color: ${msg.type === 'user' ? '#1957DB' : '#6F2EFF'};
                  `}>
                    {msg.type === 'user' ? 'You' : 'Campaign Strategist & Planner'}
                  </span>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 11px;
                    color: #9CA3AF;
                  `}>
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Container */}
                <div css={css`
                  max-width: 70%;
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                `}>
                  {/* Tool Calls - Show before message content for assistant messages */}
                  {msg.type === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div css={css`
                      display: flex;
                      flex-direction: column;
                      gap: 8px;
                    `}>
                      {msg.toolCalls.map((toolCall, toolIndex) => (
                        <ToolResponseRenderer
                          key={`tool-${index}-${toolIndex}`}
                          toolCall={toolCall}
                          success={toolCall.status !== 'ERROR' && toolCall.status !== 'FAILED'}
                        />
                      ))}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div css={css`
                    background-color: ${msg.type === 'user' ? '#F9FAFB' : '#ffffff'};
                    border: 1px solid ${msg.type === 'user' ? '#E5E7EB' : '#E5E7EB'};
                    border-radius: 12px;
                    padding: 16px 20px;
                    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
                  `}>
                    <div css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #374151;
                    `}>
                      {formatMessageContent(msg.content)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div css={css`
                    padding-left: 4px;
                  `}>
                    <MessageActions
                      message={{
                        type: msg.type,
                        content: msg.content,
                        timestamp: msg.timestamp,
                        activities: msg.toolCalls?.map(tc => tc.function_name || 'Unknown') || undefined
                      }}
                      showRegenerate={msg.type === 'assistant' && index === messages.length - 1}
                      onRegenerate={() => {
                        // Remove last assistant message and regenerate
                        setMessages(messages.slice(0, -1))
                        // Trigger regeneration by submitting the last user message
                        handleSubmit()
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div css={css`
          background-color: #ffffff;
          border-top: 1px solid #DCE1EA;
          padding: 16px 24px;
          flex-shrink: 0;
        `}>
          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <div css={css`
              display: flex;
              flex-direction: column;
              gap: 8px;
              margin-bottom: 12px;
            `}>
              {uploadedFiles.map((file) => (
                <FileAttachment
                  key={file.id}
                  file={file}
                  onRemove={() => {
                    setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
                  }}
                />
              ))}
            </div>
          )}

          <div css={css`
            display: flex;
            align-items: center;
            gap: 12px;
          `}>
            <FileUpload
              onFilesUploaded={(files) => {
                setUploadedFiles(prev => [...prev, ...files])
              }}
              disabled={isLoading}
            />

            <div css={css`
              flex: 1;
              display: flex;
              align-items: center;
              gap: 12px;
              background-color: ${isLoading ? 'rgba(25, 87, 219, 0.05)' : '#F5F7FA'};
              border-radius: 24px;
              padding: 12px 20px;
              transition: background-color 0.3s ease;
              ${isLoading ? 'border: 1px solid rgba(25, 87, 219, 0.2);' : ''}
            `}>
              {isLoading ? (
                <div css={css`
                  flex: 1;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                `}>
                  <div css={css`
                    display: flex;
                    gap: 4px;
                    @keyframes pulse {
                      0%, 100% {
                        opacity: 0.4;
                        transform: scale(1);
                      }
                      50% {
                        opacity: 1;
                        transform: scale(1.2);
                      }
                    }
                  `}>
                    <div css={css`
                      width: 8px;
                      height: 8px;
                      border-radius: 50%;
                      background: linear-gradient(135deg, #1957DB 0%, #6F2EFF 100%);
                      animation: pulse 1.4s ease-in-out infinite;
                    `} />
                    <div css={css`
                      width: 8px;
                      height: 8px;
                      border-radius: 50%;
                      background: linear-gradient(135deg, #1957DB 0%, #6F2EFF 100%);
                      animation: pulse 1.4s ease-in-out 0.2s infinite;
                    `} />
                    <div css={css`
                      width: 8px;
                      height: 8px;
                      border-radius: 50%;
                      background: linear-gradient(135deg, #1957DB 0%, #6F2EFF 100%);
                      animation: pulse 1.4s ease-in-out 0.4s infinite;
                    `} />
                  </div>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    background: linear-gradient(135deg, #1957DB 0%, #6F2EFF 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                  `}>
                    Agent is thinking...
                  </span>
                </div>
              ) : (
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send a message"
                  css={css`
                    flex: 1;
                    border: none;
                    outline: none;
                    background: transparent;
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #212327;
                    &::placeholder {
                      color: #878F9E;
                    }
                  `}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                />
              )}
              <div css={css`
                display: flex;
                gap: 8px;
                align-items: center;
              `}>
                {/* Stop button - only shows when loading */}
                {isLoading && (
                  <button
                    onClick={handleStop}
                    css={css`
                      background-color: #DC2626;
                      border: none;
                      border-radius: 4px;
                      height: 32px;
                      padding: 6px 12px;
                      display: flex;
                      align-items: center;
                      cursor: pointer;
                      transition: all 0.2s;
                      &:hover {
                        background-color: #B91C1C;
                      }
                    `}
                  >
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 13px;
                      color: white;
                      font-weight: 500;
                    `}>
                      Stop
                    </span>
                  </button>
                )}

                {/* Send button - always visible */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !message.trim()}
                  css={css`
                    background-color: #1957DB;
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    &:hover:not(:disabled) {
                      background-color: #1548B8;
                    }
                    &:disabled {
                      opacity: 0.5;
                      cursor: not-allowed;
                    }
                  `}
                >
                  <SendIcon />
                </button>
              </div>
            </div>

            {/* Menu Button - Bottom Right */}
            <div ref={menuRef} css={css`position: relative;`}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                css={css`
                  background: none;
                  border: none;
                  cursor: pointer;
                  padding: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 4px;
                  transition: background-color 0.2s;
                  &:hover {
                    background-color: #F9FBFF;
                  }
                `}
              >
                <MenuIcon />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div css={css`
                  position: absolute;
                  bottom: calc(100% + 8px);
                  right: 0;
                  background: white;
                  border: 1px solid #DCE1EA;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  min-width: 200px;
                  z-index: 1000;
                  overflow: hidden;
                `}>
                  <button
                    onClick={handleExportChat}
                    css={css`
                      width: 100%;
                      padding: 12px 16px;
                      border: none;
                      background: none;
                      text-align: left;
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #212327;
                      cursor: pointer;
                      transition: background-color 0.2s;
                      display: flex;
                      align-items: center;
                      gap: 12px;

                      &:hover {
                        background-color: #F9FBFF;
                      }
                    `}
                  >
                    <ExportIcon />
                    Export Chat
                  </button>

                  <button
                    onClick={() => {
                      console.log('Stats button clicked! Setting showStatsModal to true')
                      setShowStatsModal(true)
                      setShowMenu(false)
                    }}
                    css={css`
                      width: 100%;
                      padding: 12px 16px;
                      border: none;
                      background: none;
                      text-align: left;
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #212327;
                      cursor: pointer;
                      transition: background-color 0.2s;
                      display: flex;
                      align-items: center;
                      gap: 12px;

                      &:hover {
                        background-color: #F9FBFF;
                      }
                    `}
                  >
                    <StatsIcon />
                    View Chat Stats
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Stats Modal */}
        {showStatsModal && (() => {
          console.log('Rendering stats modal, messages:', messages.length)
          const stats = calculateStats()
          console.log('Calculated stats:', stats)
          return (
            <div
              onClick={() => setShowStatsModal(false)}
              css={css`
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
              `}>
              <div
                onClick={(e) => e.stopPropagation()}
                css={css`
                  background: white;
                  border-radius: 12px;
                  padding: 32px;
                  max-width: 500px;
                  width: 90%;
                  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                `}>
                <div css={css`
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-bottom: 24px;
                `}>
                  <h3 css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 20px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                  `}>
                    Chat Statistics
                  </h3>
                  <button
                    onClick={() => setShowStatsModal(false)}
                    css={css`
                      background: none;
                      border: none;
                      cursor: pointer;
                      padding: 4px;
                      color: #9CA3AF;
                      &:hover {
                        color: #6B7280;
                      }
                    `}
                  >
                    ✕
                  </button>
                </div>

                <div css={css`
                  display: flex;
                  flex-direction: column;
                  gap: 16px;
                `}>
                  <div css={css`
                    display: flex;
                    justify-content: space-between;
                    padding: 16px;
                    background: #F9FAFB;
                    border-radius: 8px;
                  `}>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #6B7280;
                    `}>
                      Total Messages
                    </span>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 16px;
                      font-weight: 600;
                      color: #111827;
                    `}>
                      {stats.totalMessages}
                    </span>
                  </div>

                  <div css={css`
                    display: flex;
                    justify-content: space-between;
                    padding: 16px;
                    background: #F9FAFB;
                    border-radius: 8px;
                  `}>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #6B7280;
                    `}>
                      Your Messages
                    </span>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 16px;
                      font-weight: 600;
                      color: #111827;
                    `}>
                      {stats.userMessages}
                    </span>
                  </div>

                  <div css={css`
                    display: flex;
                    justify-content: space-between;
                    padding: 16px;
                    background: #F9FAFB;
                    border-radius: 8px;
                  `}>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #6B7280;
                    `}>
                      Assistant Messages
                    </span>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 16px;
                      font-weight: 600;
                      color: #111827;
                    `}>
                      {stats.assistantMessages}
                    </span>
                  </div>

                  <div css={css`
                    display: flex;
                    justify-content: space-between;
                    padding: 16px;
                    background: #F9FAFB;
                    border-radius: 8px;
                  `}>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #6B7280;
                    `}>
                      Estimated Tokens
                    </span>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 16px;
                      font-weight: 600;
                      color: #111827;
                    `}>
                      ~{stats.estimatedTokens.toLocaleString()}
                    </span>
                  </div>

                  <div css={css`
                    display: flex;
                    justify-content: space-between;
                    padding: 16px;
                    background: #F9FAFB;
                    border-radius: 8px;
                  `}>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #6B7280;
                    `}>
                      Chat Duration
                    </span>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 16px;
                      font-weight: 600;
                      color: #111827;
                    `}>
                      {stats.duration} min
                    </span>
                  </div>

                  <div css={css`
                    display: flex;
                    justify-content: space-between;
                    padding: 16px;
                    background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
                    border: 1px solid #BAE6FD;
                    border-radius: 8px;
                  `}>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #0369A1;
                      font-weight: 600;
                    `}>
                      Estimated Cost
                    </span>
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 16px;
                      font-weight: 700;
                      color: #0284C7;
                    `}>
                      ${stats.estimatedCost.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    )
  }

  return (
    <div css={css`
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    `}>
      {/* Input Area */}
      <div css={css`
        width: 100%;
        box-shadow: 0px 2px 4px 0px rgba(135, 143, 158, 0.2);
      `}>
        <div css={css`
          background-color: #ffffff;
          border: 1px solid #DCE1EA;
          border-radius: 16px;
          padding: 1px;
          display: flex;
          flex-direction: column;
        `}>
          {/* Text Input Area */}
          <div css={css`
            padding: 32px;
            min-height: 160px;
            display: flex;
            gap: 8px;
          `}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell me about your campaign goals, which campaigns you'd like to optimize, and what reports you'd like to build"
              disabled={isLoading}
              css={css`
                flex: 1;
                border: none;
                outline: none;
                font-family: 'Figtree', sans-serif;
                font-weight: 500;
                font-size: 16px;
                color: #212327;
                resize: none;
                line-height: 1.5;
                &::placeholder {
                  color: #B6BDC9;
                }
                &:disabled {
                  background-color: #f5f5f5;
                  cursor: not-allowed;
                }
              `}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>

          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <div css={css`
              padding: 12px 32px 0;
              display: flex;
              flex-direction: column;
              gap: 8px;
              border-top: 1px solid #F0F0F0;
            `}>
              {uploadedFiles.map((file) => (
                <FileAttachment
                  key={file.id}
                  file={file}
                  onRemove={() => {
                    setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
                  }}
                />
              ))}
            </div>
          )}

          {/* Footer with File Upload and Send Button */}
          <div css={css`
            padding: 19px 20px;
            display: flex;
            flex-direction: row;
            gap: 12px;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid #F0F0F0;
          `}>
            <FileUpload
              onFilesUploaded={(files) => {
                setUploadedFiles(prev => [...prev, ...files])
              }}
              disabled={isLoading}
            />

            <div css={css`
              display: flex;
              gap: 8px;
              align-items: center;
            `}>
              {/* Stop button - only shows when loading */}
              {isLoading && (
                <button
                  onClick={handleStop}
                  css={css`
                    background-color: #DC2626;
                    border: none;
                    border-radius: 4px;
                    height: 40px;
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    &:hover {
                      background-color: #B91C1C;
                    }
                  `}
                >
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: white;
                    font-weight: 500;
                  `}>
                    Stop
                  </span>
                </button>
              )}

              {/* Send button - always visible */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || !message.trim()}
                css={css`
                  background-color: #1957DB;
                  border: none;
                  border-radius: 4px;
                  height: 40px;
                  padding: 8px 16px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  cursor: pointer;
                  transition: all 0.2s;
                  &:hover:not(:disabled) {
                    background-color: #1548B8;
                  }
                  &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                `}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      {messages.length > 0 && (
        <div
          ref={messagesContainerRef}
          css={css`
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 500px;
          overflow-y: auto;
          padding-right: 8px;
          position: relative;

          /* Custom scrollbar */
          &::-webkit-scrollbar {
            width: 6px;
          }

          &::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }

          &::-webkit-scrollbar-thumb {
            background: #DCE1EA;
            border-radius: 3px;
          }

          &::-webkit-scrollbar-thumb:hover {
            background: #B6BDC9;
          }
        `}>
          {messages.map((msg, index) => (
            <div
              key={`sidebar-msg-${msg.timestamp.getTime()}-${index}`}
              css={css`
                display: flex;
                flex-direction: column;
                gap: 8px;
              `}
            >
              {/* Message Header */}
              <div css={css`
                display: flex;
                align-items: center;
                gap: 8px;
              `}>
                <div css={css`
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: ${msg.type === 'user' ? '#E8DBFF' : 'linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%)'};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                `}>
                  {msg.type === 'user' ? (
                    <UserIcon />
                  ) : (
                    <AgentIcon />
                  )}
                </div>
                <span css={css`
                  font-family: 'Figtree', sans-serif;
                  font-weight: 600;
                  font-size: 12px;
                  color: ${msg.type === 'user' ? '#6F2EFF' : '#1957DB'};
                `}>
                  {msg.type === 'user' ? 'You' : 'Agent'}
                </span>
                <span css={css`
                  font-family: 'Figtree', sans-serif;
                  font-size: 11px;
                  color: #878F9E;
                `}>
                  {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Content */}
              <div css={css`
                background-color: #ffffff;
                border: 1px solid #DCE1EA;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0px 2px 4px 0px rgba(135, 143, 158, 0.1);
              `}>
                <div css={css`
                  font-family: 'Figtree', sans-serif;
                  font-size: 14px;
                  color: #212327;
                  line-height: 1.6;
                  white-space: pre-wrap;
                `}>
                  {msg.content}
                </div>

                {/* Show attachments if present */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div css={css`
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #F0F0F0;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                  `}>
                    {msg.attachments.map((file, idx) => (
                      <div key={idx} css={css`
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background-color: #F9FBFF;
                        border: 1px solid #DCE1EA;
                        border-radius: 8px;
                      `}>
                        {/* Preview or Icon */}
                        {file.type.startsWith('image/') && file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            css={css`
                              width: 48px;
                              height: 48px;
                              object-fit: cover;
                              border-radius: 4px;
                            `}
                          />
                        ) : (
                          <div css={css`
                            width: 48px;
                            height: 48px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            background-color: white;
                            border-radius: 4px;
                          `}>
                            {file.type.startsWith('image/') ? '🖼️' :
                             file.type === 'application/pdf' ? '📄' :
                             file.type.includes('spreadsheet') || file.type.includes('excel') ? '📊' :
                             file.type.includes('document') || file.type.includes('word') ? '📝' :
                             '📎'}
                          </div>
                        )}

                        {/* File Info */}
                        <div css={css`
                          flex: 1;
                          min-width: 0;
                        `}>
                          <div css={css`
                            font-family: 'Figtree', sans-serif;
                            font-size: 14px;
                            font-weight: 500;
                            color: #212327;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                          `}>
                            {file.name}
                          </div>
                          <div css={css`
                            font-family: 'Figtree', sans-serif;
                            font-size: 12px;
                            color: #878F9E;
                            margin-top: 2px;
                          `}>
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />

          {/* Bottom Controls: Scroll & Export */}
          <div css={css`
            position: sticky;
            bottom: 8px;
            display: flex;
            gap: 12px;
            align-items: flex-end;
            align-self: flex-end;
            margin-top: -70px;
            z-index: 10;
          `}>
            {/* Export Menu */}
            <div css={css`
              margin-bottom: 0;
            `}>
              <ExportMenu messages={messages} />
            </div>

            {/* Scroll Buttons Container */}
            <div css={css`
              display: flex;
              flex-direction: column;
              gap: 8px;
            `}>
            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              title="Scroll to top"
              css={css`
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(111, 46, 255, 0.3);
                transition: all 0.2s;

                &:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(111, 46, 255, 0.4);
                }

                &:active {
                  transform: translateY(0);
                }

                svg {
                  width: 16px;
                  height: 16px;
                  color: white;
                }
              `}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Scroll to Bottom Button */}
            <button
              onClick={scrollToBottom}
              title="Scroll to bottom"
              css={css`
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(111, 46, 255, 0.3);
                transition: all 0.2s;

                &:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(111, 46, 255, 0.4);
                }

                &:active {
                  transform: translateY(0);
                }

                svg {
                  width: 16px;
                  height: 16px;
                  color: white;
                }
              `}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4V12M8 12L12 8M8 12L4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div
          css={css`
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}>
          <div css={css`
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 480px;
            width: 90%;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            animation: slideUp 0.3s ease-out;

            @keyframes slideUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}>
            <div css={css`
              display: flex;
              align-items: center;
              gap: 16px;
              margin-bottom: 20px;
            `}>
              <div css={css`
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(25, 87, 219, 0.1) 0%, rgba(111, 46, 255, 0.1) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
              `}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#1957DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 css={css`
                font-family: 'Figtree', sans-serif;
                font-size: 20px;
                font-weight: 700;
                color: #111827;
                margin: 0;
              `}>
                Exit Chat?
              </h3>
            </div>

            <p css={css`
              font-family: 'Figtree', sans-serif;
              font-size: 15px;
              color: #64748B;
              line-height: 1.6;
              margin: 0 0 28px 0;
            `}>
              Are you sure you want to exit this chat? Your conversation will be automatically saved in chat history and you can return to it later.
            </p>

            <div css={css`
              display: flex;
              gap: 12px;
              justify-content: flex-end;
            `}>
              <button
                onClick={handleExitCancel}
                css={css`
                  padding: 12px 24px;
                  border-radius: 8px;
                  border: 1px solid #DCE1EA;
                  background: white;
                  font-family: 'Figtree', sans-serif;
                  font-size: 14px;
                  font-weight: 600;
                  color: #64748B;
                  cursor: pointer;
                  transition: all 0.2s;

                  &:hover {
                    background: #F9FBFF;
                    border-color: #B6BDC9;
                  }

                  &:active {
                    transform: scale(0.98);
                  }
                `}
              >
                Cancel
              </button>
              <button
                onClick={handleExitConfirm}
                css={css`
                  padding: 12px 24px;
                  border-radius: 8px;
                  border: none;
                  background: linear-gradient(135deg, #1957DB 0%, #6F2EFF 100%);
                  font-family: 'Figtree', sans-serif;
                  font-size: 14px;
                  font-weight: 600;
                  color: white;
                  cursor: pointer;
                  transition: all 0.2s;

                  &:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(25, 87, 219, 0.4);
                  }

                  &:active {
                    transform: scale(0.98);
                  }
                `}
              >
                Exit Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Stats Modal */}
      {showStatsModal && (() => {
        const stats = calculateStats()
        return (
          <div
            onClick={() => setShowStatsModal(false)}
            css={css`
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            `}>
            <div
              onClick={(e) => e.stopPropagation()}
              css={css`
                background: white;
                border-radius: 12px;
                padding: 32px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              `}>
              <div css={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 24px;
              `}>
                <h3 css={css`
                  font-family: 'Figtree', sans-serif;
                  font-size: 20px;
                  font-weight: 700;
                  color: #111827;
                  margin: 0;
                `}>
                  Chat Statistics
                </h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  css={css`
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    color: #9CA3AF;
                    &:hover {
                      color: #6B7280;
                    }
                  `}
                >
                  ✕
                </button>
              </div>

              <div css={css`
                display: flex;
                flex-direction: column;
                gap: 16px;
              `}>
                <div css={css`
                  display: flex;
                  justify-content: space-between;
                  padding: 16px;
                  background: #F9FAFB;
                  border-radius: 8px;
                `}>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #6B7280;
                  `}>
                    Total Messages
                  </span>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                  `}>
                    {stats.totalMessages}
                  </span>
                </div>

                <div css={css`
                  display: flex;
                  justify-content: space-between;
                  padding: 16px;
                  background: #F9FAFB;
                  border-radius: 8px;
                `}>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #6B7280;
                  `}>
                    Your Messages
                  </span>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                  `}>
                    {stats.userMessages}
                  </span>
                </div>

                <div css={css`
                  display: flex;
                  justify-content: space-between;
                  padding: 16px;
                  background: #F9FAFB;
                  border-radius: 8px;
                `}>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #6B7280;
                  `}>
                    Assistant Messages
                  </span>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                  `}>
                    {stats.assistantMessages}
                  </span>
                </div>

                <div css={css`
                  display: flex;
                  justify-content: space-between;
                  padding: 16px;
                  background: #F9FAFB;
                  border-radius: 8px;
                `}>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #6B7280;
                  `}>
                    Estimated Tokens
                  </span>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                  `}>
                    ~{stats.estimatedTokens.toLocaleString()}
                  </span>
                </div>

                <div css={css`
                  display: flex;
                  justify-content: space-between;
                  padding: 16px;
                  background: #F9FAFB;
                  border-radius: 8px;
                `}>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #6B7280;
                  `}>
                    Chat Duration
                  </span>
                  <span css={css`
                    font-family: 'Figtree', sans-serif;
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                  `}>
                    {stats.duration} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 1L7 9M15 1L10 15L7 9M15 1L1 6L7 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const LoadingSpinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    css={css`
      animation: spin 1s linear infinite;
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}
  >
    <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeDasharray="10 5" strokeLinecap="round"/>
  </svg>
)

const UserIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="4" r="2" fill="#6F2EFF"/>
    <path d="M3 10C3 8.34315 4.34315 7 6 7C7.65685 7 9 8.34315 9 10" stroke="#6F2EFF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const AgentIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" fill="white"/>
  </svg>
)

const BackArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L6 10L12 16" stroke="#212327" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const AgentIconSquare = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="url(#gradient)"/>
    <path d="M12 6L13.5 10.5L18 12L13.5 13.5L12 18L10.5 13.5L6 12L10.5 10.5L12 6Z" fill="white"/>
    <defs>
      <linearGradient id="gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6F2EFF"/>
        <stop offset="1" stopColor="#1957DB"/>
      </linearGradient>
    </defs>
  </svg>
)

const ExpandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7L3 3L7 3M13 3L17 3L17 7M17 13L17 17L13 17M7 17L3 17L3 13" stroke="#878F9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="5" r="1.5" fill="#878F9E"/>
    <circle cx="10" cy="10" r="1.5" fill="#878F9E"/>
    <circle cx="10" cy="15" r="1.5" fill="#878F9E"/>
  </svg>
)

const ThreeDotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="5" r="1.5" fill="#212327"/>
    <circle cx="10" cy="10" r="1.5" fill="#212327"/>
    <circle cx="10" cy="15" r="1.5" fill="#212327"/>
  </svg>
)

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V10M8 2L5 5M8 2L11 5" stroke="#6F2EFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10V13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V10" stroke="#6F2EFF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const StatsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="9" width="3" height="5" rx="1" fill="#6F2EFF"/>
    <rect x="6.5" y="6" width="3" height="8" rx="1" fill="#6F2EFF"/>
    <rect x="11" y="2" width="3" height="12" rx="1" fill="#6F2EFF"/>
  </svg>
)

export default ChatWindow
export type { Message }
