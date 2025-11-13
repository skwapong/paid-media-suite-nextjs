import { css } from '@emotion/react'
import type { Agent } from '../../types/agent'

interface AgentSelectorProps {
  agents: Agent[]
  selectedAgentId: string | null
  onSelectAgent: (agentId: string) => void
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ agents, selectedAgentId, onSelectAgent }) => {
  const onlineAgents = agents.filter(agent => agent.status === 'online')

  if (onlineAgents.length === 0) {
    return null
  }

  return (
    <div css={css`
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    `}>
      <div css={css`
        font-family: 'Figtree', sans-serif;
        font-weight: 600;
        font-size: 14px;
        color: #878F9E;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: center;
      `}>
        Select an Agent to Start
      </div>

      <div css={css`
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;
        width: 100%;
      `}>
        {onlineAgents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onSelectAgent(agent.agent_id)}
            css={css`
              background-color: #ffffff;
              border: 2px solid ${selectedAgentId === agent.agent_id ? '#6F2EFF' : '#DCE1EA'};
              border-radius: 12px;
              padding: 20px;
              cursor: pointer;
              transition: all 0.2s;
              ${selectedAgentId === agent.agent_id && `
                background-color: #F3EEFF;
                box-shadow: 0px 4px 16px rgba(111, 46, 255, 0.15);
              `}
              &:hover {
                border-color: #6F2EFF;
                box-shadow: 0px 4px 16px rgba(111, 46, 255, 0.15);
              }
            `}
          >
            <div css={css`
              display: flex;
              flex-direction: column;
              gap: 12px;
            `}>
              {/* Agent Icon and Name */}
              <div css={css`
                display: flex;
                align-items: center;
                gap: 12px;
              `}>
                <div css={css`
                  width: 40px;
                  height: 40px;
                  min-width: 40px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                `}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" fill="white"/>
                    <path d="M19 15L20 18L23 19L20 20L19 23L18 20L15 19L18 18L19 15Z" fill="white"/>
                  </svg>
                </div>
                <h3 css={css`
                  font-family: 'Figtree', sans-serif;
                  font-weight: 600;
                  font-size: 16px;
                  color: ${selectedAgentId === agent.agent_id ? '#6F2EFF' : '#212327'};
                  margin: 0;
                  line-height: 1.3;
                `}>
                  {agent.name}
                </h3>
              </div>

              {/* Description */}
              <p css={css`
                font-family: 'Figtree', sans-serif;
                font-weight: 400;
                font-size: 14px;
                color: #6D6D6D;
                margin: 0;
                line-height: 1.5;
              `}>
                {agent.description}
              </p>

              {/* Capabilities */}
              {agent.capabilities && agent.capabilities.length > 0 && (
                <div css={css`
                  display: flex;
                  flex-wrap: wrap;
                  gap: 6px;
                `}>
                  {agent.capabilities.slice(0, 3).map((capability, idx) => (
                    <span
                      key={idx}
                      css={css`
                        font-family: 'Figtree', sans-serif;
                        font-size: 11px;
                        padding: 4px 10px;
                        background-color: ${selectedAgentId === agent.agent_id ? '#E8DBFF' : '#F3EEFF'};
                        color: #6F2EFF;
                        border-radius: 12px;
                        font-weight: 500;
                      `}
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentSelector
