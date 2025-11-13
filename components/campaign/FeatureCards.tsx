import { css } from '@emotion/react'
import type { Agent } from '../../types/agent'

interface FeatureCardsProps {
  agents?: Agent[]
  selectedAgentId?: string | null
  onSelectAgent?: (agentId: string) => void
}

const FeatureCards: React.FC<FeatureCardsProps> = ({ agents, selectedAgentId, onSelectAgent }) => {
  // Find the Campaign Strategist & Planner agent
  const strategistAgent = agents?.find(agent =>
    agent.id === 'campaign-strategist-planner-agent' ||
    agent.id.includes('strategist') ||
    agent.name.toLowerCase().includes('strategist')
  )

  // Find the Campaign Optimizer agent
  const optimizerAgent = agents?.find(agent =>
    agent.id === 'campaign-optimizer-agent' ||
    (agent.id.includes('optimizer') && agent.id.includes('campaign'))
  )

  // Find the Performance Reporter agent (for Campaign Reporting)
  const reporterAgent = agents?.find(agent =>
    agent.id === 'performance-reporter-agent' ||
    (agent.id.includes('reporter') || agent.id.includes('report'))
  )

  // Build display agents array with real agents if found, otherwise use defaults
  const displayAgents = [
    strategistAgent || {
      id: 'campaign-builder',
      name: 'Campaign Building',
      description: 'Design new campaigns from strategy to launch',
      capabilities: [],
      outputs: [],
      status: 'online' as const,
      agent_id: '',
      version: '1.0.0'
    },
    optimizerAgent || {
      id: 'campaign-optimizer',
      name: 'Campaign Optimization',
      description: 'Improve performance with data-driven insights and recommendations',
      capabilities: [],
      outputs: [],
      status: 'pending' as const,
      agent_id: '',
      version: '1.0.0'
    },
    reporterAgent || {
      id: 'campaign-reporter',
      name: 'Campaign Reporting',
      description: 'Build and share reports showcasing performance and insights',
      capabilities: [],
      outputs: [],
      status: 'pending' as const,
      agent_id: '',
      version: '1.0.0'
    }
  ]

  return (
    <div css={css`
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      width: 100%;
    `}>
      {displayAgents.map((agent) => (
        <FeatureCard
          key={agent.id}
          title={agent.name}
          description={agent.description}
          agentId={agent.id}
          agent_id={agent.agent_id}
          capabilities={agent.capabilities}
          status={agent.status}
          isSelected={selectedAgentId === agent.agent_id}
          onSelectAgent={onSelectAgent}
        />
      ))}
    </div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  agentId: string
  agent_id: string
  capabilities?: string[]
  status?: 'online' | 'offline' | 'pending'
  isSelected?: boolean
  onSelectAgent?: (agentId: string) => void
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, agentId, agent_id, capabilities, status, isSelected, onSelectAgent }) => {
  const getIcon = () => {
    if (agentId.includes('campaign') || agentId.includes('strategist') || title.toLowerCase().includes('campaign')) {
      if (title.toLowerCase().includes('build') || title.toLowerCase().includes('strateg') || title.toLowerCase().includes('plan')) {
        return <CampaignBuildingIcon />
      } else if (title.toLowerCase().includes('optimiz')) {
        return <CampaignOptimizationIcon />
      } else if (title.toLowerCase().includes('report')) {
        return <CampaignReportingIcon />
      }
    }
    return <DefaultAgentIcon />
  }

  const isActive = status === 'online'

  const handleClick = () => {
    if (isActive && onSelectAgent && agent_id) {
      onSelectAgent(agent_id)
    }
  }

  return (
    <div
      onClick={handleClick}
      css={css`
        background-color: ${isSelected ? '#F3EEFF' : '#ffffff'};
        border: 2px solid ${isSelected ? '#6F2EFF' : '#DCE1EA'};
        border-radius: 8px;
        overflow: hidden;
        cursor: ${isActive ? 'pointer' : 'not-allowed'};
        transition: all 0.2s;
        opacity: ${isActive ? '1' : '0.6'};
        ${isActive && `
          &:hover {
            box-shadow: 0px 4px 16px rgba(111, 46, 255, 0.15);
            border-color: #6F2EFF;
            background-color: ${isSelected ? '#F3EEFF' : '#FAFBFF'};
          }
        `}
      `}>
      <div css={css`
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      `}>
        <div css={css`
          display: flex;
          gap: 12px;
          align-items: flex-start;
        `}>
          {/* Icon */}
          <div css={css`
            width: 24px;
            height: 24px;
            min-width: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          `}>
            {getIcon()}
          </div>

          {/* Text Content */}
          <div css={css`
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
          `}>
            <div css={css`
              display: flex;
              align-items: center;
              gap: 8px;
            `}>
              <h3 css={css`
                font-family: 'Figtree', sans-serif;
                font-weight: 600;
                font-size: 16px;
                background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin: 0;
                line-height: 1.3;
              `}>
                {title}
              </h3>
              {status === 'pending' && (
                <span css={css`
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                  padding: 2px 8px;
                  border-radius: 10px;
                  font-size: 11px;
                  font-weight: 600;
                  font-family: 'Figtree', sans-serif;
                  background-color: #FEF3C7;
                  color: #92400E;
                `}>
                  <span css={css`
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: #F59E0B;
                  `} />
                  Pending
                </span>
              )}
            </div>
            <p css={css`
              font-family: 'Figtree', sans-serif;
              font-weight: 400;
              font-size: 14px;
              color: #6D6D6D;
              margin: 0;
              line-height: 1.5;
            `}>
              {description}
            </p>
            {capabilities && capabilities.length > 0 && (
              <div css={css`
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                margin-top: 4px;
              `}>
                {capabilities.slice(0, 3).map((cap, idx) => (
                  <span
                    key={idx}
                    css={css`
                      font-family: 'Figtree', sans-serif;
                      font-size: 11px;
                      padding: 2px 8px;
                      background-color: #F3EEFF;
                      color: #6F2EFF;
                      border-radius: 12px;
                      font-weight: 500;
                    `}
                  >
                    {cap}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const CampaignBuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="3" height="8" fill="#6F2EFF"/>
    <rect x="8" y="6" width="3" height="12" fill="#6F2EFF"/>
    <rect x="14" y="8" width="3" height="10" fill="#6F2EFF"/>
  </svg>
)

const CampaignOptimizationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="4" height="4" fill="#6F2EFF"/>
    <rect x="13" y="3" width="4" height="4" fill="#6F2EFF"/>
    <rect x="3" y="13" width="4" height="4" fill="#6F2EFF"/>
    <rect x="13" y="13" width="4" height="4" fill="#6F2EFF"/>
    <line x1="7" y1="5" x2="13" y2="5" stroke="#6F2EFF" strokeWidth="1.5"/>
    <line x1="7" y1="15" x2="13" y2="15" stroke="#6F2EFF" strokeWidth="1.5"/>
    <line x1="5" y1="7" x2="5" y2="13" stroke="#6F2EFF" strokeWidth="1.5"/>
    <line x1="15" y1="7" x2="15" y2="13" stroke="#6F2EFF" strokeWidth="1.5"/>
  </svg>
)

const CampaignReportingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="3" height="7" fill="#6F2EFF"/>
    <rect x="8.5" y="7" width="3" height="11" fill="#6F2EFF"/>
    <rect x="14" y="9" width="3" height="9" fill="#6F2EFF"/>
  </svg>
)

const DefaultAgentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L12 7L17 9L12 11L10 16L8 11L3 9L8 7L10 2Z" fill="#6F2EFF"/>
  </svg>
)

export default FeatureCards
