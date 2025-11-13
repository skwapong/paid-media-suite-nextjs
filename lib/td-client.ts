import { TDChatResponse } from '@/types/chat';

const TD_API_URL = process.env.TD_API_URL || 'https://llm-api-development.us01.treasuredata.com';
const TD_API_KEY = process.env.TD_API_KEY || '';
const TD_AGENT_ID = process.env.TD_AGENT_ID || '';

export async function createChat(): Promise<string> {
  // Validate environment variables
  if (!TD_API_KEY) {
    throw new Error('TD_API_KEY is not set. Please check your .env.local file.');
  }
  if (!TD_AGENT_ID) {
    throw new Error('TD_AGENT_ID is not set. Please check your .env.local file.');
  }

  console.log('Creating chat with:', {
    url: `${TD_API_URL}/api/chats`,
    agentId: TD_AGENT_ID,
    hasApiKey: !!TD_API_KEY,
  });

  console.log(`TD1 ${TD_API_KEY}`)
  const response = await fetch(`${TD_API_URL}/api/chats`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/vnd.api+json",
      'Authorization': `TD1 ${TD_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: 'chats',
        attributes: {
          agentId: TD_AGENT_ID,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('TD API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Failed to create chat: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data: TDChatResponse = await response.json();
  return data.data.id;
}

export async function continueChat(chatId: string, input: string): Promise<Response> {
  const response = await fetch(`${TD_API_URL}/api/chats/${chatId}/continue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `TD1 ${TD_API_KEY}`,
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error(`Failed to continue chat: ${response.statusText}`);
  }

  return response;
}
