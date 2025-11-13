import { css } from '@emotion/react'
import { useState, useCallback, useEffect } from 'react'
import ChatWindow, { type Message } from './ChatWindow'
import FeatureCards from './FeatureCards'
import { useAgents } from '../../hooks/useAgents'
import { ChatHistoryService } from '../../services/chatHistory'
import ExportMenu from '../chat/ExportMenu'

interface CampaignHubProps {
  chatIdToLoad?: string | null
  onClearChat?: () => void
  isLeftNavExpanded?: boolean
}

const CampaignHub: React.FC<CampaignHubProps> = ({ chatIdToLoad, onClearChat, isLeftNavExpanded = false }) => {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const { data: agentsData, isLoading } = useAgents()

  console.log('CampaignHub rendering, agents:', agentsData)

  // Set default agent to Campaign Building (strategist) on mount
  useEffect(() => {
    if (agentsData?.agents && !selectedAgentId) {
      const strategistAgent = agentsData.agents.find(agent =>
        agent.id === 'campaign-strategist-planner-agent' ||
        agent.id.includes('strategist') ||
        agent.name.toLowerCase().includes('strategist')
      )
      if (strategistAgent?.agent_id) {
        console.log('Setting default agent to Campaign Building:', strategistAgent.agent_id)
        setSelectedAgentId(strategistAgent.agent_id)
      }
    }
  }, [agentsData, selectedAgentId])

  // Handle agent selection
  const handleSelectAgent = useCallback((agentId: string) => {
    console.log('Selected agent:', agentId)
    setSelectedAgentId(agentId)
  }, [])

  // Extract client input from firstInputContent
  const extractClientInput = (content: string): string => {
    return ChatHistoryService.parseClientInput(content)
  }

  // Load chat history and restore conversation
  const handleLoadChatHistory = useCallback(async (chatId: string) => {
    setIsLoadingHistory(true)
    try {
      console.log('Loading chat history for:', chatId)
      const historyData = await ChatHistoryService.getChatHistoryDetails(chatId)

      // Parse the chat history data
      const messages: Message[] = []

      if (historyData?.data) {
        for (const event of historyData.data) {
          // User input
          if (event.input) {
            const clientInput = extractClientInput(event.input)

            // Check if this message had attachments (the API doesn't return the files themselves)
            // We can detect this by checking if the input mentions attachments or files
            const hasAttachmentReference = event.input.toLowerCase().includes('attachment') ||
                                          event.input.toLowerCase().includes('file') ||
                                          event.input.toLowerCase().includes('image') ||
                                          event.input.toLowerCase().includes('document')

            let messageContent = clientInput
            if (hasAttachmentReference && !clientInput.toLowerCase().includes('[attachment')) {
              messageContent = `${clientInput}\n\n[Note: Attachments were included with this message but cannot be displayed from chat history]`
            }

            messages.push({
              type: 'user',
              content: messageContent,
              timestamp: new Date(event.at)
            })
          }

          // Agent/orchestrator response
          if (event.content) {
            messages.push({
              type: 'assistant',
              content: event.content,
              timestamp: new Date(event.at)
            })
          }
        }
      }

      console.log('Restored messages:', messages)
      setChatHistory(messages)
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  // Auto-load chat when chatIdToLoad prop changes
  useEffect(() => {
    if (chatIdToLoad) {
      handleLoadChatHistory(chatIdToLoad)
    } else if (chatIdToLoad === null) {
      // Clear chat history when explicitly set to null
      setChatHistory([])
    }
  }, [chatIdToLoad, handleLoadChatHistory])

  // Clear chat history and start fresh conversation
  const handleClearChat = useCallback(() => {
    console.log('🔙 CampaignHub: Clearing chat and resetting to hub view')
    setChatHistory([])
    // Notify parent component to reset chatIdToLoad
    if (onClearChat) {
      console.log('🔙 CampaignHub: Calling onClearChat to reset chatIdToLoad')
      onClearChat()
    } else {
      console.warn('⚠️ CampaignHub: onClearChat callback not provided')
    }
  }, [onClearChat])

  return (
    <div css={css`
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background-color: #ffffff;
      overflow: hidden;
    `}>
      {/* Header */}
      <header css={css`
        border-bottom: 1px solid #DCE1EA;
        min-height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        gap: 12px;
        flex-shrink: 0;
        background-color: #ffffff;
      `}>
        <div css={css`
          display: flex;
          align-items: center;
          gap: 12px;
        `}>
          {/* Agent Avatar */}
          <div css={css`
            width: 28px;
            height: 28px;
            min-width: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            position: relative;
            overflow: hidden;
          `}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" fill="white"/>
              <path d="M19 15L20 18L23 19L20 20L19 23L18 20L15 19L18 18L19 15Z" fill="white"/>
            </svg>
          </div>

          {/* Title */}
          <h1 css={css`
            font-family: 'Figtree', sans-serif;
            font-weight: 600;
            font-size: 20px;
            color: #000000;
            margin: 0;
            line-height: 1.4;
          `}>
            Campaign Hub
          </h1>
        </div>

        {/* Export Menu - only show when viewing chat history */}
        {chatIdToLoad && chatHistory.length > 0 && (
          <ExportMenu messages={chatHistory} />
        )}
      </header>

      {/* Main Content */}
      <div css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 24px;
        overflow-y: auto;
        gap: 32px;
        background-color: #F9FBFF;
      `}>
        <div css={css`
          max-width: 800px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 32px;
        `}>
          {/* Title Section */}
          <div css={css`
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: center;
            text-align: center;
            width: 100%;
            position: relative;
          `}>
            {chatHistory.length > 0 && (
              <button
                onClick={handleClearChat}
                css={css`
                  position: absolute;
                  right: 0;
                  top: 0;
                  background-color: #ffffff;
                  border: 1px solid #DCE1EA;
                  border-radius: 8px;
                  padding: 8px 16px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  cursor: pointer;
                  transition: all 0.2s;
                  font-family: 'Figtree', sans-serif;
                  font-size: 14px;
                  font-weight: 500;
                  color: #212327;
                  &:hover {
                    background-color: #F9FBFF;
                    border-color: #6F2EFF;
                    color: #6F2EFF;
                  }
                `}
              >
                <CloseIcon />
                New Conversation
              </button>
            )}
            <h2 css={css`
              font-family: 'Figtree', sans-serif;
              font-weight: 600;
              font-size: 32px;
              color: #6F2EFF;
              background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin: 0;
              line-height: 1.2;
            `}>
              Campaign Agent
            </h2>
            <p css={css`
              font-family: 'Figtree', sans-serif;
              font-weight: 400;
              font-size: 18px;
              color: #6D6D6D;
              margin: 0;
              line-height: 1.4;
            `}>
              {isLoading ? 'Loading agents...' : 'What would you like to focus on today?'}
            </p>
          </div>

          {/* Chat Window */}
          {isLoadingHistory ? (
            <div css={css`
              padding: 24px;
              text-align: center;
              color: #878F9E;
              font-size: 14px;
            `}>
              Loading chat history...
            </div>
          ) : (
            <>
              <ChatWindow
                message={message}
                setMessage={setMessage}
                chatHistory={chatHistory}
                onChatHistoryChange={setChatHistory}
                selectedAgentId={selectedAgentId}
                isLeftNavExpanded={isLeftNavExpanded}
                onBack={handleClearChat}
              />

              {/* Feature Cards */}
              <FeatureCards
                agents={agentsData?.agents}
                selectedAgentId={selectedAgentId}
                onSelectAgent={handleSelectAgent}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default CampaignHub
