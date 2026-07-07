import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { Node, Edge } from 'reactflow';

interface Message {
  role: 'user' | 'mentor';
  content: string;
}

interface AIMentorProps {
  nodes: Node[];
  edges: Edge[];
}

export default function AIMentor({ nodes, edges }: AIMentorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'mentor', content: 'Hi! I am your AI Architecture Mentor. I can see your current canvas. What questions do you have?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'MENTOR',
          prompt: JSON.stringify({
            canvas_state: { nodes, edges },
            user_question: userMessage
          })
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // the response is stringified JSON containing mentor response
      // "result" contains the LLM output which might be a JSON string or wrapped in markdown
      let rawText = data.result;
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText);

      let mentorContent = parsed.answer;
      if (parsed.suggestion) {
         mentorContent += `\n\n**Suggestion:** ${parsed.suggestion}`;
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
    <div className="fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl shadow-black flex flex-col z-50 overflow-hidden">
      <div className="bg-[#1A1A1D] p-4 flex items-center justify-between border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-lg">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">AI Mentor</h3>
            <p className="text-xs text-gray-400">Context-aware architecture guide</p>
          </div>
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
                 ? 'bg-indigo-600 text-white rounded-tr-sm' 
                 : 'bg-[#1A1A1D] border border-[#27272A] text-gray-300 rounded-tl-sm'
             }`}>
               <div className="markdown-body">
                  <Markdown>{msg.content}</Markdown>
               </div>
             </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-[#1A1A1D] border border-[#27272A] text-gray-400 rounded-xl rounded-tl-sm p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-[#27272A] bg-[#1A1A1D] flex gap-2">
         <input 
           type="text" 
           value={input}
           onChange={(e) => setInput(e.target.value)}
           placeholder="Ask about your architecture..."
           className="flex-1 bg-[#111113] border border-[#27272A] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
         />
         <button 
           type="submit"
           disabled={isLoading || !input.trim()}
           className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
         >
           <Send className="w-4 h-4" />
         </button>
      </form>
    </div>
  );
}
