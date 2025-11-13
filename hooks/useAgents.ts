import { useQuery } from '@tanstack/react-query'
import type { AgentsDiscovery } from '../types/agent'

export const useAgents = () => {
  return useQuery<AgentsDiscovery>({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await fetch('/agents-discovery.json')
      if (!response.ok) {
        throw new Error('Failed to load agents')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAgent = (agentId: string) => {
  const { data: agentsData } = useAgents()

  if (!agentsData) return null

  return agentsData.agents.find(agent => agent.id === agentId)
}
