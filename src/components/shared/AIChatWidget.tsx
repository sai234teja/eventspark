'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi, I\'m Sparky! ⚡ How can I help you find your next event?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.ok) throw new Error('Failed to fetch response');
      
      const data = await response.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting right now. Please try again later!'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        aria-label="Open Chat"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-[#6C47FF] text-white rounded-full shadow-lg shadow-[#6C47FF]/25 hover:scale-105 transition-all z-50 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="p-4 bg-[#6C47FF] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Sparky AI</h2>
              <p className="text-[10px] text-white/80 uppercase tracking-wider font-bold">Event Assistant</p>
            </div>
          </div>
          <button 
            aria-label="Close Chat"
            onClick={() => setIsOpen(false)}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0A0A0F]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user' 
                  ? 'bg-[#6C47FF] text-white rounded-br-sm' 
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-bl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1">
                <span className="w-2 h-2 bg-[#6C47FF] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-[#6C47FF] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-[#6C47FF] rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white dark:bg-[#111118] border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-[#6C47FF] focus:bg-white dark:focus:bg-slate-950 rounded-full text-sm text-slate-900 dark:text-white outline-none transition-all"
            />
            <Button 
              aria-label="Send Message"
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-full bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white p-0 shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
