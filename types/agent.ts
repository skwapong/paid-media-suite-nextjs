export interface Agent {
  id: string
  agent_id: string
  name: string
  description: string
  capabilities: string[]
  outputs: string[]
  usage_instructions?: string
  status: 'online' | 'offline'
  version: string
}

export interface Orchestrator {
  id: string
  agent_id: string
  name: string
  description: string
  capabilities: string[]
  outputs: string[]
  status: 'online' | 'offline'
  version: string
}

export interface AgentsDiscovery {
  orchestrator: Orchestrator
  agents: Agent[]
  metadata: {
    last_updated: string
    total_agents: number
    online_agents: number
  }
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  agentId?: string
}

export interface Campaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  budget: number
  startDate: string
  endDate?: string
  platform: string
  metrics?: {
    impressions?: number
    clicks?: number
    conversions?: number
    spend?: number
  }
}
