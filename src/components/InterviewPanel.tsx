import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Brain, AlertTriangle } from 'lucide-react';
import Markdown from 'react-markdown';
import { loadSettings } from './Settings';

interface InterviewPanelProps {
  nodes: any[];
  edges: any[];
  onClose?: () => void;
}

export default function InterviewPanel({ nodes, edges, onClose }: InterviewPanelProps) {
  const [messages, setMessages] = useState<{role: 'interviewer'|'candidate', content: string}[]>([
    { role: 'interviewer', content: 'Welcome to your mock system design interview. I will be acting as your Senior Engineering Manager. To begin, please select a problem you would like to design, or I can give you one. (e.g. "Design WhatsApp", "Design Netflix", "Design a URL Shortener")' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<'FAANG_STAFF' | 'STARTUP_CTO' | 'MENTOR'>('FAANG_STAFF');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'candidate', content: userMessage }]);
    setIsLoading(true);

    try {
      const currentSettings = loadSettings();
      const payload = JSON.stringify({
         canvas_state: { nodes: nodes.map(n => n.data?.label || n.id), edges: edges.length },
         conversation_history: messages.slice(-5),
         last_user_response: userMessage,
         persona
      });

      const response = await fetch('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'INTERVIEW',
          prompt: payload,
          settings: currentSettings
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let rawText = data.result;
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      let parsed = { question: 'Sorry, I encountered an error.', interviewer_thought: '', evaluation_score: 0, is_finished: false };
      try {
        parsed = JSON.parse(rawText);
      } catch (err) {
        console.error('Failed to parse AI response:', rawText);
        parsed.question = rawText; // Fallback
      }

      // Add thought as an invisible or expandable message? We'll just show the question.
      // But let's show the thought in a small tooltip or debug view so the user can learn from it.
      
      const combinedResponse = `**Thought process:** *${parsed.interviewer_thought}*\n\n**Interviewer:** ${parsed.question}`;

      setMessages(prev => [...prev, { role: 'interviewer', content: combinedResponse }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'interviewer', content: "Network or AI Error: " + error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-96 bg-[#111113]/95 backdrop-blur-xl border-l border-[#1F1F22] shadow-2xl flex flex-col z-40 transform transition-transform duration-300">
      <div className="p-4 border-b border-[#27272A] flex items-center justify-between bg-indigo-900/20">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
             <Brain className="w-5 h-5 text-indigo-400" />
           </div>
           <div>
             <h3 className="text-sm font-bold text-white">AI Interviewer</h3>
             <select 
                value={persona} 
                onChange={(e) => setPersona(e.target.value as any)}
                className="bg-transparent text-xs text-indigo-300 outline-none border-none cursor-pointer hover:text-indigo-200 p-0 m-0"
              >
                <option value="FAANG_STAFF">FAANG Staff Engineer</option>
                <option value="STARTUP_CTO">Startup CTO</option>
                <option value="MENTOR">Helpful Mentor</option>
              </select>
           </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <User className="w-4 h-4 opacity-0" /> {/* Spacer */}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-3 text-sm text-amber-200/80 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p>
            The AI can see your canvas. Draw your architecture on the left, and explain your decisions here.
          </p>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'candidate' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'candidate' ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {msg.role === 'candidate' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`flex-1 rounded-2xl p-3 text-sm ${
              msg.role === 'candidate' 
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50' 
                : 'bg-[#1A1A1D] border border-[#27272A] text-gray-200'
            }`}>
              <div className="prose prose-invert prose-sm max-w-none">
                <Markdown>
                  {msg.content}
                </Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#1A1A1D] border border-[#27272A] rounded-2xl p-4 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#27272A] bg-[#111113]">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Explain your design..."
            className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 aspect-square rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-[#27272A] disabled:text-gray-500 flex items-center justify-center text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
