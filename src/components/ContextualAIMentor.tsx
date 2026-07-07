import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { loadSettings } from './Settings';

interface ContextualAIMentorProps {
  context: any;
}

export default function ContextualAIMentor({ context }: ContextualAIMentorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'mentor'|'user', content: string}[]>([
    { role: 'mentor', content: 'Hi! I am your AI Architecture Mentor. I know what you are currently working on. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-mentor', handleOpen);
    return () => window.removeEventListener('open-ai-mentor', handleOpen);
  }, []);

  // Optionally, when context changes significantly, we could inject a system message, but we'll just pass context to the API on send.
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const currentSettings = loadSettings();
      const payload = JSON.stringify({
         user_context: context,
         user_question: userMessage,
         conversation_history: messages
      });

      const response = await fetch('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'MENTOR',
          prompt: payload,
          settings: currentSettings
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let rawText = data.result;
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let mentorContent = "";
      try {
        const parsed = JSON.parse(rawText);
        mentorContent = parsed.answer;
        if (parsed.suggestion) {
           mentorContent += `\n\n**Suggestion:** ${parsed.suggestion}`;
        }
      } catch (e) {
        mentorContent = rawText; // Fallback if not JSON
      }

      setMessages(prev => [...prev, { role: 'mentor', content: mentorContent }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'mentor', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/20 transition-all hover:scale-105 z-50 flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 h-screen w-[400px] bg-[#111113] border-l border-[#1F1F22] shadow-2xl flex flex-col z-50 transform transition-transform duration-300">
      <div className="h-14 bg-[#111113] border-b border-[#1F1F22] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-medium text-sm">AI Mentor</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
               msg.role === 'user' 
                 ? 'bg-indigo-600 text-white' 
                 : 'bg-[#1A1A1D] border border-[#27272A] text-gray-300'
             }`}>
            <div className="prose prose-invert max-w-none text-sm prose-p:leading-relaxed prose-pre:bg-[#0A0A0B] prose-pre:border prose-pre:border-[#27272A]">
               <Markdown>
                 {msg.content}
               </Markdown>
            </div>
             </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-[#1A1A1D] border border-[#27272A] rounded-xl p-4 text-gray-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span className="text-xs">Thinking...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#0A0A0B] border-t border-[#1F1F22]">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your current task..."
            className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-lg pl-4 pr-12 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
