import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are Sparky, the friendly AI assistant for EventSpark, a modern real-time event management platform. 
Your goal is to help users find events, check prices, or manage their organizer dashboard.
Keep your answers helpful, concise, and friendly. Use emojis occasionally.
When users ask about events in general, tell them they can browse community events or premium paid experiences.
When users ask about organizing, tell them they can create events easily from the Organizer Dashboard.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Map existing messages to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Understood. I am Sparky, the EventSpark assistant.' }] },
        ...contents
      ],
    });

    return NextResponse.json({ message: response.text });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
