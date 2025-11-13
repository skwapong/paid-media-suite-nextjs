import { css } from '@emotion/react'
import { useState, useEffect, useRef } from 'react'
import { ChatHistoryService } from '../../services/chatHistory'
import type { ChatHistoryItem } from '../../types/chat'
import { useAgents } from '../../hooks/useAgents'

interface ChatHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onLoadChat?: (chatId: string) => void
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ isOpen, onClose, onLoadChat }) => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<ChatHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const modalRef = useRef<HTMLDivElement>(null)
  const { data: agentsData } = useAgents()

  const onlineAgents = agentsData?.agents?.filter(agent => agent.status === 'online') || []

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Load all chat history when agent is selected (no limit)
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
      // Remove the limit parameter to get all conversations
      const response = await ChatHistoryService.getAgentChatHistory(agentId, 1000) // Using high number instead of no limit
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

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleChatSelect = (chatItem: ChatHistoryItem) => {
    console.log('Selected chat:', chatItem.id)
    onClose()

    if (onLoadChat) {
      onLoadChat(chatItem.id)
    }
  }

  const handleBackToAgents = () => {
    setSelectedAgentId(null)
    setSearchQuery('')
    setDateFilter('all')
    setChatHistory([])
    setFilteredHistory([])
  }

  if (!isOpen) return null

  return (
    <div css={css`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    `}>
      <div
        ref={modalRef}
        css={css`
          background-color: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `}
      >
        {/* Modal Header */}
        <div css={css`
          padding: 24px;
          border-bottom: 1px solid #DCE1EA;
          display: flex;
          align-items: center;
          justify-content: space-between;
        `}>
          <h2 css={css`
            font-family: 'Figtree', sans-serif;
            font-size: 20px;
            font-weight: 600;
            color: #212327;
            margin: 0;
          `}>
            {selectedAgentId ? 'Chat History' : 'Select Agent'}
          </h2>
          <button
            onClick={onClose}
            css={css`
              background: none;
              border: none;
              color: #878F9E;
              cursor: pointer;
              padding: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 6px;
              transition: all 0.2s;

              &:hover {
                background-color: #F9FBFF;
                color: #6F2EFF;
              }

              svg {
                width: 20px;
                height: 20px;
              }
            `}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Filters - Only show when agent is selected */}
        {selectedAgentId && (
          <div css={css`
            padding: 16px 24px;
            border-bottom: 1px solid #DCE1EA;
            background-color: #F9FBFF;
          `}>
            <div css={css`
              display: flex;
              gap: 12px;
              margin-bottom: 12px;
            `}>
              {/* Search Filter */}
              <div css={css`
                flex: 1;
                position: relative;
              `}>
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  css={css`
                    width: 100%;
                    padding: 10px 12px 10px 36px;
                    border: 1px solid #DCE1EA;
                    border-radius: 6px;
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #212327;
                    outline: none;
                    transition: all 0.2s;

                    &:focus {
                      border-color: #6F2EFF;
                      box-shadow: 0 0 0 3px rgba(111, 46, 255, 0.1);
                    }

                    &::placeholder {
                      color: #878F9E;
                    }
                  `}
                />
              </div>
            </div>

            {/* Date Filter Buttons */}
            <div css={css`
              display: flex;
              gap: 8px;
            `}>
              {(['all', 'today', 'week', 'month'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  css={css`
                    padding: 8px 16px;
                    border: 1px solid ${dateFilter === filter ? '#6F2EFF' : '#DCE1EA'};
                    background-color: ${dateFilter === filter ? '#F3EEFF' : 'white'};
                    color: ${dateFilter === filter ? '#6F2EFF' : '#878F9E'};
                    border-radius: 6px;
                    font-family: 'Figtree', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;

                    &:hover {
                      background-color: ${dateFilter === filter ? '#F3EEFF' : '#F9FBFF'};
                      border-color: #6F2EFF;
                    }
                  `}
                >
                  {filter === 'all' ? 'All Time' : filter === 'today' ? 'Today' : filter === 'week' ? 'Last Week' : 'Last Month'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div css={css`
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
        `}>
          {/* Agent Selection */}
          {!selectedAgentId && (
            <>
              {onlineAgents.length === 0 ? (
                <div css={css`
                  padding: 40px 16px;
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
                      padding: 16px;
                      border-radius: 8px;
                      cursor: pointer;
                      transition: all 0.2s;
                      margin-bottom: 8px;
                      border: 1px solid transparent;

                      &:hover {
                        background-color: #F3EEFF;
                        border-color: #6F2EFF;
                      }
                    `}
                  >
                    <div css={css`
                      font-family: 'Figtree', sans-serif;
                      font-weight: 600;
                      font-size: 15px;
                      color: #212327;
                      margin-bottom: 4px;
                    `}>
                      {agent.name}
                    </div>
                    <div css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 13px;
                      color: #878F9E;
                    `}>
                      {agent.description}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Chat History List */}
          {selectedAgentId && (
            <>
              <div css={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16px;
              `}>
                <div css={css`
                  font-family: 'Figtree', sans-serif;
                  font-size: 14px;
                  color: #878F9E;
                `}>
                  {filteredHistory.length} conversation{filteredHistory.length !== 1 ? 's' : ''}
                </div>
                <button
                  onClick={handleBackToAgents}
                  css={css`
                    background: none;
                    border: none;
                    color: #6F2EFF;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 6px 12px;
                    border-radius: 4px;
                    transition: all 0.2s;

                    &:hover {
                      background-color: #F3EEFF;
                    }
                  `}
                >
                  ← Back to Agents
                </button>
              </div>

              {isLoading ? (
                <div css={css`
                  padding: 40px;
                  text-align: center;
                  color: #878F9E;
                  font-size: 14px;
                `}>
                  Loading conversations...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div css={css`
                  padding: 40px;
                  text-align: center;
                  color: #878F9E;
                  font-size: 14px;
                `}>
                  {searchQuery || dateFilter !== 'all' ? 'No conversations match your filters' : 'No chat history found'}
                </div>
              ) : (
                filteredHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatSelect(chat)}
                    css={css`
                      padding: 16px;
                      border-radius: 8px;
                      cursor: pointer;
                      transition: all 0.2s;
                      border: 1px solid #F0F0F0;
                      margin-bottom: 8px;

                      &:hover {
                        background-color: #F3EEFF;
                        border-color: #6F2EFF;
                      }
                    `}
                  >
                    <div css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 14px;
                      color: #212327;
                      margin-bottom: 6px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      display: -webkit-box;
                      -webkit-line-clamp: 2;
                      -webkit-box-orient: vertical;
                      line-height: 1.5;
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
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    css={css`
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #878F9E;
      pointer-events: none;
    `}
  >
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export default ChatHistoryModal
