import { css } from '@emotion/react'
import { useState, useEffect } from 'react'

// Agent Settings Component with Editing Capabilities
interface AgentConfig {
  id: string
  agent_id: string
  name: string
  description: string
  capabilities: string[]
  outputs: string[]
  usage_instructions: string
  status: 'online' | 'offline' | 'pending'
  version: string
}

interface AgentsDiscoveryConfig {
  orchestrator: AgentConfig
  agents: AgentConfig[]
  metadata: {
    last_updated: string
    total_agents: number
    online_agents: number
    discovery_endpoint: string
    refresh_interval: number
  }
}

interface AgentSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const AgentSettings: React.FC<AgentSettingsProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<AgentsDiscoveryConfig | null>(null)
  const [originalConfig, setOriginalConfig] = useState<AgentsDiscoveryConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [editingAgent, setEditingAgent] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/agents-discovery.json')
        if (!response.ok) {
          throw new Error('Failed to load agents configuration')
        }
        const data = await response.json()
        setConfig(data)
        setOriginalConfig(JSON.parse(JSON.stringify(data))) // Deep clone
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration')
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadConfig()
    }
  }, [isOpen])

  const updateAgent = (agentId: string, updates: Partial<AgentConfig>) => {
    if (!config) return

    setConfig(prev => {
      if (!prev) return prev

      const newConfig = { ...prev }
      if (agentId === 'orchestrator') {
        newConfig.orchestrator = { ...newConfig.orchestrator, ...updates }
      } else {
        newConfig.agents = newConfig.agents.map(agent =>
          agent.id === agentId ? { ...agent, ...updates } : agent
        )
      }
      return newConfig
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!config) return

    try {
      const response = await fetch('http://localhost:3001/api/agents-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Configuration saved:', result)

      setOriginalConfig(JSON.parse(JSON.stringify(config)))
      setHasChanges(false)
      setEditingAgent(null)

      alert(`Configuration saved successfully!\nTimestamp: ${result.timestamp}`)
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}\n\nMake sure the API server is running on port 3001.`)
    }
  }

  const handleReset = () => {
    if (!originalConfig) return

    setConfig(JSON.parse(JSON.stringify(originalConfig)))
    setHasChanges(false)
    setEditingAgent(null)
  }

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?')
      if (!confirmed) return
    }

    // Reset to original config if there were unsaved changes
    if (hasChanges && originalConfig) {
      setConfig(JSON.parse(JSON.stringify(originalConfig)))
      setHasChanges(false)
    }

    setEditingAgent(null)
    onClose()
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
      z-index: 1000;
    `}>
      <div css={css`
        background-color: #ffffff;
        border-radius: 12px;
        width: 90%;
        max-width: 1200px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
      `}>
        {/* Header */}
        <div css={css`
          padding: 24px 32px;
          border-bottom: 1px solid #DCE1EA;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #ffffff;
        `}>
          <div>
            <h2 css={css`
              font-family: 'Figtree', sans-serif;
              font-weight: 600;
              font-size: 24px;
              color: #212327;
              margin: 0 0 8px 0;
            `}>
              Agent Settings
            </h2>
            {config && (
              <p css={css`
                font-family: 'Figtree', sans-serif;
                font-size: 14px;
                color: #6D6D6D;
                margin: 0;
              `}>
                Total Agents: {config.metadata.total_agents} | Online: {config.metadata.online_agents}
              </p>
            )}
          </div>
          <div css={css`display: flex; gap: 8px; align-items: center;`}>
            {hasChanges && (
              <>
                <button
                  onClick={handleReset}
                  css={css`
                    background-color: #F3F4F6;
                    border: 1px solid #DCE1EA;
                    border-radius: 6px;
                    padding: 8px 16px;
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: #6D6D6D;
                    cursor: pointer;
                    transition: all 0.2s;
                    &:hover {
                      background-color: #E5E7EB;
                    }
                  `}
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  css={css`
                    background-color: #1957DB;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 16px;
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    &:hover {
                      background-color: #1548B8;
                    }
                  `}
                >
                  Save Changes
                </button>
              </>
            )}
            <button
              onClick={handleClose}
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
                  background-color: #F0F0F0;
                }
              `}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="#212327" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div css={css`
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          background-color: #F9FBFF;
        `}>
          {loading && (
            <div css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 48px;
              font-family: 'Figtree', sans-serif;
              color: #6D6D6D;
            `}>
              Loading agent configuration...
            </div>
          )}

          {error && (
            <div css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 48px;
              font-family: 'Figtree', sans-serif;
              color: #DC2626;
            `}>
              Error: {error}
            </div>
          )}

          {config && (
            <div css={css`
              display: flex;
              flex-direction: column;
              gap: 24px;
            `}>
              {/* Orchestrator Section */}
              <div>
                <h3 css={css`
                  font-family: 'Figtree', sans-serif;
                  font-weight: 600;
                  font-size: 18px;
                  color: #212327;
                  margin: 0 0 16px 0;
                `}>
                  Orchestrator
                </h3>
                <AgentCard
                  agent={config.orchestrator}
                  isExpanded={expandedAgent === config.orchestrator.id}
                  onToggle={() => setExpandedAgent(expandedAgent === config.orchestrator.id ? null : config.orchestrator.id)}
                  isOrchestrator
                  isEditing={editingAgent === config.orchestrator.id}
                  onEdit={() => {
                    setEditingAgent(editingAgent === config.orchestrator.id ? null : config.orchestrator.id)
                    if (expandedAgent !== config.orchestrator.id) {
                      setExpandedAgent(config.orchestrator.id)
                    }
                  }}
                  onUpdate={(updates) => updateAgent('orchestrator', updates)}
                />
              </div>

              {/* External Agents Section */}
              <div>
                <h3 css={css`
                  font-family: 'Figtree', sans-serif;
                  font-weight: 600;
                  font-size: 18px;
                  color: #212327;
                  margin: 0 0 16px 0;
                `}>
                  External Agents ({config.agents.length})
                </h3>
                <div css={css`
                  display: flex;
                  flex-direction: column;
                  gap: 16px;
                `}>
                  {config.agents.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isExpanded={expandedAgent === agent.id}
                      onToggle={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                      isEditing={editingAgent === agent.id}
                      onEdit={() => {
                        setEditingAgent(editingAgent === agent.id ? null : agent.id)
                        if (expandedAgent !== agent.id) {
                          setExpandedAgent(agent.id)
                        }
                      }}
                      onUpdate={(updates) => updateAgent(agent.id, updates)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// StatusBadge Component
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'pending'
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColors = () => {
    switch (status) {
      case 'online':
        return {
          bg: '#DCFCE7',
          text: '#166534',
          dot: '#22C55E'
        }
      case 'offline':
        return {
          bg: '#FEE2E2',
          text: '#991B1B',
          dot: '#EF4444'
        }
      case 'pending':
        return {
          bg: '#FEF3C7',
          text: '#92400E',
          dot: '#F59E0B'
        }
    }
  }

  const colors = getStatusColors()

  return (
    <span css={css`
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      font-family: 'Figtree', sans-serif;
      background-color: ${colors.bg};
      color: ${colors.text};
    `}>
      <span css={css`
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: ${colors.dot};
      `} />
      {status}
    </span>
  )
}

interface AgentCardProps {
  agent: AgentConfig
  isExpanded: boolean
  onToggle: () => void
  isOrchestrator?: boolean
  isEditing?: boolean
  onEdit?: () => void
  onUpdate?: (updates: Partial<AgentConfig>) => void
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isExpanded,
  onToggle,
  isOrchestrator,
  isEditing = false,
  onEdit,
  onUpdate
}) => {
  return (
    <div css={css`
      background-color: #ffffff;
      border: 1px solid #DCE1EA;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0px 2px 4px rgba(135, 143, 158, 0.1);
    `}>
      {/* Header */}
      <div css={css`
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: 16px;
      `}>
        <div css={css`
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        `}>
          {/* Title Row */}
          <div css={css`
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          `}>
            <h4 css={css`
              font-family: 'Figtree', sans-serif;
              font-weight: 600;
              font-size: 16px;
              color: #212327;
              margin: 0;
            `}>
              {agent.name}
            </h4>
            <StatusBadge status={agent.status} />
            {isOrchestrator && (
              <span css={css`
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                background-color: #E0E7FF;
                color: #4338CA;
              `}>
                Orchestrator
              </span>
            )}
          </div>

          {/* Description */}
          <p css={css`
            font-family: 'Figtree', sans-serif;
            font-size: 14px;
            color: #6D6D6D;
            margin: 0;
            line-height: 1.5;
          `}>
            {agent.description}
          </p>

          {/* IDs */}
          <div css={css`
            display: flex;
            gap: 24px;
            padding: 12px;
            background-color: #F9FBFF;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
          `}>
            <div>
              <span css={css`color: #6D6D6D;`}>ID:</span>
              <span css={css`color: #212327; margin-left: 8px;`}>{agent.id}</span>
            </div>
            <div>
              <span css={css`color: #6D6D6D;`}>Agent ID:</span>
              <span css={css`color: #212327; margin-left: 8px;`}>{agent.agent_id}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div css={css`display: flex; gap: 8px;`}>
          {onEdit && (
            <button
              onClick={onEdit}
              css={css`
                background-color: ${isEditing ? '#1957DB' : '#F3F4F6'};
                border: 1px solid ${isEditing ? '#1957DB' : '#DCE1EA'};
                border-radius: 6px;
                padding: 6px 12px;
                font-family: 'Figtree', sans-serif;
                font-size: 13px;
                font-weight: 500;
                color: ${isEditing ? 'white' : '#6D6D6D'};
                cursor: pointer;
                transition: all 0.2s;
                &:hover {
                  background-color: ${isEditing ? '#1548B8' : '#E5E7EB'};
                }
              `}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          )}
          <button
            onClick={onToggle}
          css={css`
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6D6D6D;
            transition: color 0.2s;
            &:hover {
              color: #212327;
            }
          `}
        >
          {isExpanded ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 12.5L10 7.5L15 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div css={css`
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #DCE1EA;
          display: flex;
          flex-direction: column;
          gap: 16px;
        `}>
          {/* Edit Mode Fields */}
          {isEditing && onUpdate && (
            <div css={css`
              padding: 16px;
              background-color: #F9FBFF;
              border-radius: 8px;
              border: 1px solid #E0E7FF;
              display: flex;
              flex-direction: column;
              gap: 16px;
            `}>
              <h5 css={css`
                font-family: 'Figtree', sans-serif;
                font-weight: 600;
                font-size: 14px;
                color: #212327;
                margin: 0;
              `}>
                Edit Agent Configuration
              </h5>

              {/* Name Input */}
              <div css={css`display: flex; flex-direction: column; gap: 6px;`}>
                <label css={css`
                  font-family: 'Figtree', sans-serif;
                  font-size: 13px;
                  font-weight: 500;
                  color: #6D6D6D;
                `}>
                  Name
                </label>
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  css={css`
                    padding: 8px 12px;
                    border: 1px solid #DCE1EA;
                    border-radius: 6px;
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #212327;
                    &:focus {
                      outline: none;
                      border-color: #1957DB;
                    }
                  `}
                />
              </div>

              {/* Description Textarea */}
              <div css={css`display: flex; flex-direction: column; gap: 6px;`}>
                <label css={css`
                  font-family: 'Figtree', sans-serif;
                  font-size: 13px;
                  font-weight: 500;
                  color: #6D6D6D;
                `}>
                  Description
                </label>
                <textarea
                  value={agent.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  rows={3}
                  css={css`
                    padding: 8px 12px;
                    border: 1px solid #DCE1EA;
                    border-radius: 6px;
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #212327;
                    resize: vertical;
                    &:focus {
                      outline: none;
                      border-color: #1957DB;
                    }
                  `}
                />
              </div>

              {/* Status Select */}
              <div css={css`display: flex; flex-direction: column; gap: 6px;`}>
                <label css={css`
                  font-family: 'Figtree', sans-serif;
                  font-size: 13px;
                  font-weight: 500;
                  color: #6D6D6D;
                `}>
                  Status
                </label>
                <select
                  value={agent.status}
                  onChange={(e) => onUpdate({ status: e.target.value as 'online' | 'offline' | 'pending' })}
                  css={css`
                    padding: 8px 12px;
                    border: 1px solid #DCE1EA;
                    border-radius: 6px;
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #212327;
                    background-color: white;
                    cursor: pointer;
                    &:focus {
                      outline: none;
                      border-color: #1957DB;
                    }
                  `}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Usage Instructions Textarea */}
              <div css={css`display: flex; flex-direction: column; gap: 6px;`}>
                <label css={css`
                  font-family: 'Figtree', sans-serif;
                  font-size: 13px;
                  font-weight: 500;
                  color: #6D6D6D;
                `}>
                  Usage Instructions
                </label>
                <textarea
                  value={agent.usage_instructions}
                  onChange={(e) => onUpdate({ usage_instructions: e.target.value })}
                  rows={2}
                  css={css`
                    padding: 8px 12px;
                    border: 1px solid #DCE1EA;
                    border-radius: 6px;
                    font-family: 'Figtree', sans-serif;
                    font-size: 14px;
                    color: #212327;
                    resize: vertical;
                    &:focus {
                      outline: none;
                      border-color: #1957DB;
                    }
                  `}
                />
              </div>
            </div>
          )}

          {/* Capabilities */}
          <div>
            <h5 css={css`
              font-family: 'Figtree', sans-serif;
              font-weight: 600;
              font-size: 14px;
              color: #212327;
              margin: 0 0 8px 0;
            `}>
              Capabilities ({agent.capabilities.length})
            </h5>
            <div css={css`
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            `}>
              {agent.capabilities.map(capability => (
                <span key={capability} css={css`
                  display: inline-block;
                  padding: 6px 12px;
                  border-radius: 4px;
                  font-size: 12px;
                  background-color: #EEF2FF;
                  color: #4338CA;
                  font-family: 'Figtree', sans-serif;
                `}>
                  {capability}
                </span>
              ))}
            </div>
          </div>

          {/* Output Types */}
          <div>
            <h5 css={css`
              font-family: 'Figtree', sans-serif;
              font-weight: 600;
              font-size: 14px;
              color: #212327;
              margin: 0 0 8px 0;
            `}>
              Output Types ({agent.outputs.length})
            </h5>
            <div css={css`
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            `}>
              {agent.outputs.map(output => (
                <span key={output} css={css`
                  display: inline-block;
                  padding: 6px 12px;
                  border-radius: 4px;
                  font-size: 12px;
                  background-color: #F0F9FF;
                  color: #0369A1;
                  font-family: 'Courier New', monospace;
                `}>
                  {output}
                </span>
              ))}
            </div>
          </div>

          {/* Usage Instructions */}
          {agent.usage_instructions && (
            <div>
              <h5 css={css`
                font-family: 'Figtree', sans-serif;
                font-weight: 600;
                font-size: 14px;
                color: #212327;
                margin: 0 0 8px 0;
              `}>
                Usage Instructions
              </h5>
              <p css={css`
                font-family: 'Figtree', sans-serif;
                font-size: 13px;
                color: #6D6D6D;
                margin: 0;
                line-height: 1.6;
                padding: 12px;
                background-color: #FFFBEB;
                border-left: 3px solid #F59E0B;
                border-radius: 4px;
              `}>
                {agent.usage_instructions}
              </p>
            </div>
          )}

          {/* Version */}
          <div css={css`
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Figtree', sans-serif;
            font-size: 12px;
            color: #6D6D6D;
          `}>
            <span>Version:</span>
            <span css={css`
              padding: 4px 8px;
              background-color: #F3F4F6;
              border-radius: 4px;
              color: #212327;
              font-family: 'Courier New', monospace;
            `}>
              {agent.version}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentSettings
