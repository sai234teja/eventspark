import { NextResponse } from 'next/server';

// This is a mocked AI endpoint for demonstration purposes.
// In a real implementation, you would wire this up to the OpenAI or Anthropic API using the Vercel AI SDK.
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Simulate network delay for "thinking"
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple mocked responses based on keywords
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    let reply = "I'm your EventSpark AI assistant! I'm still learning, but I can help you discover events, check ticket prices, or manage your organizer dashboard.";

    if (lastMessage.includes('tech') || lastMessage.includes('hyderabad')) {
      reply = "There's a massive Tech Summit happening in Hyderabad on August 12th, 2026! It's one of our most popular events. Would you like me to send you the link to book tickets?";
    } else if (lastMessage.includes('price') || lastMessage.includes('cost') || lastMessage.includes('free')) {
      reply = "Event prices vary! We have completely free community events as well as premium paid experiences. You can easily see the price on any event card, or use the 'Free' filter on the Browse Events page.";
    } else if (lastMessage.includes('create') || lastMessage.includes('organize')) {
      reply = "Creating an event is super easy! Just head to your Organizer Dashboard and click 'Create Event'. You can set up multiple ticket tiers, beautiful banners, and track your sales all in one place.";
    } else if (lastMessage.includes('wallet') || lastMessage.includes('money')) {
      reply = "You can manage your funds directly from your Wallet in the dashboard. You can add money securely using our Razorpay integration!";
    }

    return NextResponse.json({ message: reply });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
