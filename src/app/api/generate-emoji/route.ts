import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY_EMOJIS,
});

export async function POST(request: Request) {
  try {
    const { text, nodeType } = await request.json();

    if (!text?.trim() || text.trim().length < 3) {
      return NextResponse.json({ emoji: null });
    }

    const model = (process.env.MODEL_NAME ?? 'claude-haiku-4-5') as Anthropic.Model;

    const message = await anthropic.messages.create({
      model,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: `You pick ONE emoji that best represents this ${nodeType === 'event' ? 'life event' : 'action/decision'}.
Return ONLY the emoji character, nothing else.

Text: "${text.trim()}"`,
        },
      ],
    });

    const emoji =
      message.content[0].type === 'text'
        ? message.content[0].text.trim().slice(0, 2)
        : null;

    return NextResponse.json({ emoji });
  } catch (error) {
    console.error('generate-emoji error:', error);
    return NextResponse.json({ emoji: null }, { status: 500 });
  }
}