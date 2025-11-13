import { NextResponse } from 'next/server';
import { createChat } from '@/lib/td-client';

export async function POST() {
  try {
    const chatId = await createChat();
    return NextResponse.json({ chatId });
  } catch (error) {
    console.error('Error creating chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create chat';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
