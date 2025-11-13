import { css } from '@emotion/react'
import { useState, useEffect } from 'react'
import { ChatHistoryService } from '../../services/chatHistory'
import type { ChatHistoryItem } from '../../types/chat'
import { useAgents } from '../../hooks/useAgents'

interface ChatHistoryDropdownProps {
  onLoadChat?: (chatId: string) => void
}

const ChatHistoryDropdown: React.FC<ChatHistoryDropdownProps> = ({ onLoadChat }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<ChatHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const { data: agentsData } = useAgents()

  const onlineAgents = agentsData?.agents?.filter(agent => agent.status === 'online') || []

  // Load chat history when agent is selected
  useEffect(() => {
    if (isOpen && selectedAgentId) {
      loadChatHistory(selectedAgentId)
    }
  }, [isOpen, selectedAgentId])

  // Filter chat history based on search and date filters
  useEffect(() => {
    let filtered = [...chatHistory]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(chat =>
        ChatHistoryService.parseClientInput(chat.attributes.firstInputContent).toLowerCase().includes(query)
      )
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter(chat => {
        const chatDate = new Date(chat.attributes.lastConversationAt || chat.attributes.createdAt)
        return chatDate >= filterDate
      })
    }

    setFilteredHistory(filtered)
  }, [chatHistory, searchQuery, dateFilter])

  const loadChatHistory = async (agentId: string) => {
    setIsLoading(true)
    try {
      // Increase limit to 100
      const response = await ChatHistoryService.getAgentChatHistory(agentId, 100)
      setChatHistory(response.data || [])
    } catch (error) {
      console.error('Failed to load chat history:', error)
      setChatHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleChatSelect = (chatItem: ChatHistoryItem) => {
    console.log('Selected chat:', chatItem.id)
    setIsOpen(false)

    // Call the onLoadChat callback to restore the conversation
    if (onLoadChat) {
      onLoadChat(chatItem.id)
    }
  }

  return (
    <div css={css`
      position: relative;
      width: 100%;
    `}>
      {/* Dropdown Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        css={css`
          background-color: #ffffff;
          border: 1px solid #DCE1EA;
          border-radius: 8px;
          min-height: 48px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          &:hover {
            background-color: #F9FBFF;
            border-color: #6F2EFF;
          }
        `}
      >
        <HistoryIcon />
        <span css={css`
          font-family: 'Figtree', sans-serif;
          font-weight: 400;
          font-size: 16px;
          color: #212327;
          flex: 1;
          line-height: 1.4;
        `}>
          Select Agent
        </span>
        <ChevronIcon isOpen={isOpen} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div css={css`
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background-color: #ffffff;
          border: 1px solid #DCE1EA;
          border-radius: 8px;
          box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
        `}>
          {/* Agent Selection */}
          {!selectedAgentId && (
            <div css={css`
              padding: 12px;
            `}>
              <div css={css`
                font-family: 'Figtree', sans-serif;
                font-weight: 600;
                font-size: 12px;
                color: #878F9E;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 8px 12px;
              `}>
                Select Agent
              </div>
              {onlineAgents.length === 0 ? (
                <div css={css`
                  padding: 16px;
                  text-align: center;
                  color: #878F9E;
                  font-size: 14px;
                `}>
                  No active agents available
                </div>
              ) : (
                onlineAgents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.agent_id)}
                    css={css`
                      padding: 12px;
                      border-radius: 6px;
                      cursor: pointer;
                      transition: background-color 0.2s;
                      &:hover {
                        background-color: #F3EEFF;
                      }
                    `}
                  >
                    <div css={css`
                      font-family: 'Figtree', sans-serif;
                      font-weight: 600;
                      font-size: 14px;
                      color: #212327;
                    `}>
                      {agent.name}
                    </div>
                    <div css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 12px;
                      color: #878F9E;
                      margin-top: 4px;
                    `}>
                      {agent.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Chat History List */}
          {selectedAgentId && (
            <div css={css`
              padding: 12px;
            `}>
              <div css={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                margin-bottom: 8px;
              `}>
                <div css={css`
                  font-family: 'Figtree', sans-serif;
                  font-weight: 600;
                  font-size: 12px;
                  color: #878F9E;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                `}>
                  Recent Conversations {filteredHistory.length > 0 && `(${filteredHistory.length})`}
                </div>
                <button
                  onClick={() => setSelectedAgentId(null)}
                  css={css`
                    background: none;
                    border: none;
                    color: #6F2EFF;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    &:hover {
                      background-color: #F3EEFF;
                    }
                  `}
                >
                  Back
                </button>
              </div>

              {/* Search Input */}
              <div css={css`
                padding: 0 12px 12px 12px;
              `}>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  css={css`
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #DCE1EA;
                    border-radius: 6px;
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #212327;
                    transition: all 0.2s;

                    &:focus {
                      outline: none;
                      border-color: #6F2EFF;
                      background-color: #F9FBFF;
                    }

                    &::placeholder {
                      color: #878F9E;
                    }
                  `}
                />
              </div>

              {/* Date Filters */}
              <div css={css`
                padding: 0 12px 12px 12px;
                display: flex;
                gap: 8px;
              `}>
                {(['all', 'today', 'week', 'month'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    css={css`
                      flex: 1;
                      padding: 8px 12px;
                      background-color: ${dateFilter === filter ? '#6F2EFF' : '#F9FBFF'};
                      color: ${dateFilter === filter ? '#FFFFFF' : '#212327'};
                      border: 1px solid ${dateFilter === filter ? '#6F2EFF' : '#DCE1EA'};
                      border-radius: 6px;
                      font-family: 'Figtree', sans-serif;
                      font-size: 12px;
                      font-weight: 500;
                      cursor: pointer;
                      transition: all 0.2s;

                      &:hover {
                        background-color: ${dateFilter === filter ? '#5A25CC' : '#F3EEFF'};
                        border-color: #6F2EFF;
                      }
                    `}
                  >
                    {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : filter === 'week' ? 'Week' : 'Month'}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div css={css`
                  padding: 24px;
                  text-align: center;
                  color: #878F9E;
                  font-size: 14px;
                `}>
                  Loading...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div css={css`
                  padding: 24px;
                  text-align: center;
                  color: #878F9E;
                  font-size: 14px;
                `}>
                  {chatHistory.length === 0 ? 'No chat history found' : 'No conversations match your filters'}
                </div>
              ) : (
                <div css={css`
                  max-height: 300px;
                  overflow-y: auto;
                `}>
                  {filteredHistory.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleChatSelect(chat)}
                      css={css`
                        padding: 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                        border-bottom: 1px solid #F0F0F0;
                        &:last-child {
                          border-bottom: none;
                        }
                        &:hover {
                          background-color: #F3EEFF;
                        }
                      `}
                    >
                      <div css={css`
                        font-family: 'Figtree', sans-serif;
                        font-size: 14px;
                        color: #212327;
                        margin-bottom: 4px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      `}>
                        {ChatHistoryService.parseClientInput(chat.attributes.firstInputContent)}
                      </div>
                      <div css={css`
                        font-family: 'Figtree', sans-serif;
                        font-size: 12px;
                        color: #878F9E;
                      `}>
                        {formatDate(chat.attributes.lastConversationAt || chat.attributes.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3V8L11 11" stroke="#212327" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2" stroke="#212327" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    css={css`
      transition: transform 0.2s;
      transform: rotate(${isOpen ? '180deg' : '0deg'});
    `}
  >
    <path d="M4 6L8 10L12 6" stroke="#AEAEAE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default ChatHistoryDropdown
