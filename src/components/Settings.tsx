import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, Server, Cpu, Check, AlertCircle, ArrowUp, ArrowDown, Trash2, HelpCircle } from 'lucide-react';
import { AISettings, AIProvider } from '../types';
import SetupHelpCenter from './SetupHelpCenter';

const defaultProviders: AIProvider[] = [
  { id: 'gemini', name: 'Google Gemini', enabled: true, apiKey: '', priority: 1, selectedModel: 'gemini-1.5-flash', models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'] },
  { id: 'anthropic', name: 'Anthropic Claude', enabled: false, apiKey: '', priority: 2, selectedModel: 'claude-3-5-sonnet-20240620', models: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'] },
  { id: 'openai', name: 'OpenAI', enabled: false, apiKey: '', priority: 3, selectedModel: 'gpt-4o', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { id: 'groq', name: 'Groq', enabled: false, apiKey: '', priority: 4, selectedModel: 'llama3-70b-8192', models: ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'] },
  { id: 'openrouter', name: 'OpenRouter', enabled: false, apiKey: '', priority: 5, selectedModel: 'auto', models: ['auto', 'meta-llama/llama-3-70b-instruct', 'anthropic/claude-3-opus'] }
];

export const loadSettings = (): AISettings => {
  const saved = localStorage.getItem('ai_settings');
  if (saved) {
    return JSON.parse(saved);
  }
  return { providers: defaultProviders, smartRouting: true };
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'HELP'>('GENERAL');
  const [settings, setSettings] = useState<AISettings>(loadSettings());
  const [isSaved, setIsSaved] = useState(false);

  const saveSettings = () => {
    localStorage.setItem('ai_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const updateProvider = (id: string, updates: Partial<AIProvider>) => {
    setSettings(prev => ({
      ...prev,
      providers: prev.providers.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newProviders = [...settings.providers].sort((a, b) => a.priority - b.priority);
    if (direction === 'up' && index > 0) {
      [newProviders[index - 1], newProviders[index]] = [newProviders[index], newProviders[index - 1]];
    } else if (direction === 'down' && index < newProviders.length - 1) {
      [newProviders[index + 1], newProviders[index]] = [newProviders[index], newProviders[index + 1]];
    }
    
    // Re-assign priorities based on new order
    newProviders.forEach((p, i) => p.priority = i + 1);
    
    setSettings(prev => ({ ...prev, providers: newProviders }));
  };

  const sortedProviders = [...settings.providers].sort((a, b) => a.priority - b.priority);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#0A0A0B]">
      <div className="max-w-4xl mx-auto space-y-8 mt-4 pb-20">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-indigo-400" />
              Settings
            </h1>
            <p className="text-gray-400 text-sm">Manage your application configuration and help center.</p>
          </div>
          
          <div className="flex bg-[#111113] p-1 rounded-xl border border-[#1F1F22]">
            <button 
              onClick={() => setActiveTab('GENERAL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'GENERAL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-white'}`}
            >
              General Settings
            </button>
            <button 
              onClick={() => setActiveTab('HELP')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'HELP' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-white'}`}
            >
              Setup & Help Center
            </button>
          </div>
        </header>

        {activeTab === 'GENERAL' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#111113] border border-[#1F1F22] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" /> Smart Routing
                </h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.smartRouting} onChange={(e) => setSettings({...settings, smartRouting: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                When enabled, the AI Provider Manager intelligently routes requests. Explanations use fast models, architecture validation uses strong reasoning models. If disabled, only the highest priority enabled provider is used for everything.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" /> Providers & Failover Priority
              </h2>
              <p className="text-sm text-gray-400">Drag or use arrows to set failover priority. If Provider #1 is rate-limited or fails, Provider #2 takes over automatically.</p>
              
              <div className="space-y-3">
                {sortedProviders.map((provider, index) => (
                  <div key={provider.id} className={`bg-[#111113] border ${provider.enabled ? 'border-indigo-500/30' : 'border-[#1F1F22]'} rounded-xl p-5 flex flex-col gap-4 transition-colors`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <button onClick={() => movePriority(index, 'up')} disabled={index === 0} className="text-gray-600 hover:text-white disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                            <button onClick={() => movePriority(index, 'down')} disabled={index === sortedProviders.length - 1} className="text-gray-600 hover:text-white disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-[#1A1A1D] border border-[#27272A] flex items-center justify-center text-xs font-bold text-gray-400">
                          {provider.priority}
                        </span>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{provider.name}</h3>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={provider.enabled} onChange={(e) => updateProvider(provider.id, { enabled: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {provider.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 ml-14">
                        <div>
                          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">API Key</label>
                          <div className="relative">
                            <Key className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                              type="password"
                              value={provider.apiKey}
                              onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                              placeholder={`Enter ${provider.name} API Key`}
                              className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-lg py-2 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Default Model</label>
                          <select 
                            value={provider.selectedModel}
                            onChange={(e) => updateProvider(provider.id, { selectedModel: e.target.value })}
                            className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          >
                            {provider.models.map(model => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                onClick={saveSettings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {isSaved ? 'Settings Saved' : 'Save Configuration'}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SetupHelpCenter />
          </div>
        )}
      </div>
    </div>
  );
}
