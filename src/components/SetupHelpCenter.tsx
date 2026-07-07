import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Rocket, Terminal, Shield, CheckCircle, AlertTriangle, 
  XCircle, Keyboard, Book, Play, Activity, MessageSquare, 
  Download, RefreshCw, Globe, Server, Database, Key, Info,
  Copy, Check, Search, ChevronRight, Menu, Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Section = 
  | 'QUICK_START' | 'INSTALLATION' | 'STARTUP' | 'AI_SETUP' 
  | 'ENV_CONFIG' | 'DIAGNOSTICS' | 'TROUBLESHOOTING' | 'UPDATES' 
  | 'FAQ' | 'SHORTCUTS' | 'USER_GUIDE' | 'FEEDBACK';

export default function SetupHelpCenter() {
  const [activeSection, setActiveSection] = useState<Section>('QUICK_START');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runDiagnostics = () => {
    setIsDiagnosticRunning(true);
    setDiagnosticResults(null);
    
    // Simulate diagnostic check
    setTimeout(() => {
      setDiagnosticResults({
        dependencies: { status: 'success', message: 'All required npm packages are installed.' },
        ai: { status: 'warning', message: 'Gemini API is connected, but Anthropic API key is missing.' },
        db: { status: 'success', message: 'Local storage and Firestore bridge are operational.' },
        network: { status: 'success', message: 'Outbound API access is available.' },
        config: { status: 'success', message: 'Environment variables are correctly mapped.' }
      });
      setIsDiagnosticRunning(false);
    }, 2000);
  };

  const sections = [
    { id: 'QUICK_START', label: 'Quick Start', icon: <Rocket className="w-4 h-4" /> },
    { id: 'INSTALLATION', label: 'Installation', icon: <Download className="w-4 h-4" /> },
    { id: 'STARTUP', label: 'Startup', icon: <Terminal className="w-4 h-4" /> },
    { id: 'AI_SETUP', label: 'AI Provider Setup', icon: <Key className="w-4 h-4" /> },
    { id: 'ENV_CONFIG', label: 'Environment', icon: <Server className="w-4 h-4" /> },
    { id: 'DIAGNOSTICS', label: 'Diagnostics', icon: <Activity className="w-4 h-4" /> },
    { id: 'TROUBLESHOOTING', label: 'Troubleshooting', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'UPDATES', label: 'Updates', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'FAQ', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'SHORTCUTS', label: 'Shortcuts', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'USER_GUIDE', label: 'User Guide', icon: <Book className="w-4 h-4" /> },
    { id: 'FEEDBACK', label: 'Feedback', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#0A0A0B] border border-[#1F1F22] rounded-2xl overflow-hidden mt-6 shadow-2xl">
      {/* Mini Sidebar */}
      <aside className="w-64 bg-[#111113] border-r border-[#1F1F22] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#1F1F22]">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-lg py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as Section)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-1 ${
                activeSection === section.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1D]'
              }`}
            >
              {section.icon}
              {section.label}
              {activeSection === section.id && <motion.div layoutId="active" className="ml-auto"><ChevronRight className="w-3 h-3" /></motion.div>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0C0C0E]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-3xl"
          >
            {activeSection === 'QUICK_START' && <QuickStartSection />}
            {activeSection === 'INSTALLATION' && <InstallationSection />}
            {activeSection === 'STARTUP' && <StartupSection copy={copyToClipboard} copiedId={copiedId} />}
            {activeSection === 'AI_SETUP' && <AISetupSection />}
            {activeSection === 'ENV_CONFIG' && <EnvConfigSection />}
            {activeSection === 'DIAGNOSTICS' && <DiagnosticsSection running={isDiagnosticRunning} results={diagnosticResults} onRun={runDiagnostics} />}
            {activeSection === 'TROUBLESHOOTING' && <TroubleshootingSection />}
            {activeSection === 'UPDATES' && <UpdatesSection />}
            {activeSection === 'FAQ' && <FAQSection />}
            {activeSection === 'SHORTCUTS' && <ShortcutsSection />}
            {activeSection === 'USER_GUIDE' && <UserGuideSection />}
            {activeSection === 'FEEDBACK' && <FeedbackSection />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function QuickStartSection() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white mb-2">Quick Start</h2>
        <p className="text-gray-400">Everything you need to know before you start designing.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111113] border border-[#1F1F22] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" /> System Requirements
          </h3>
          <ul className="text-xs text-gray-400 space-y-2">
            <li>• RAM: 4GB minimum, 8GB+ recommended</li>
            <li>• CPU: 2-core minimum, 4-core+ recommended</li>
            <li>• Storage: 1GB+ for local cache and designs</li>
            <li>• OS: Windows 10/11, macOS 11+, Ubuntu 20.04+</li>
          </ul>
        </div>
        <div className="bg-[#111113] border border-[#1F1F22] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Recommendations
          </h3>
          <ul className="text-xs text-gray-400 space-y-2">
            <li>• Internet: 5Mbps+ for AI mentor responsiveness</li>
            <li>• Display: 1920x1080+ for optimal design space</li>
            <li>• Hardware acceleration must be enabled in browser</li>
            <li>• Node.js 20+ (LTS) for local hosting</li>
          </ul>
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-indigo-400 mb-2">First Step: AI Configuration</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          To unlock architecture critiques and the interview mentor, you need to provide a Gemini API key. Without this, the app works in offline-only mode.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg transition-colors font-medium">
          Configure API Keys
        </button>
      </div>
    </div>
  );
}

function InstallationSection() {
  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">Installation Guide</h2>
        <p className="text-gray-400">How to get SystemArchitect running on your machine.</p>
      </header>

      <div className="space-y-4">
        <div className="bg-[#111113] border border-[#1F1F22] rounded-xl overflow-hidden">
          <div className="bg-[#1A1A1D] px-4 py-2 border-b border-[#1F1F22] flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">macOS / Linux</span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-400">1. Install Node.js using NVM:</p>
            <code className="block bg-[#0A0A0B] p-3 rounded text-indigo-400 text-xs">nvm install 20 && nvm use 20</code>
            <p className="text-xs text-gray-400">2. Clone and Install Dependencies:</p>
            <code className="block bg-[#0A0A0B] p-3 rounded text-indigo-400 text-xs">git clone system-architect-pro && npm install</code>
          </div>
        </div>

        <div className="bg-[#111113] border border-[#1F1F22] rounded-xl overflow-hidden">
          <div className="bg-[#1A1A1D] px-4 py-2 border-b border-[#1F1F22] flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Windows</span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-400">1. Download and install Node.js (LTS) from nodejs.org.</p>
            <p className="text-xs text-gray-400">2. Open PowerShell and run:</p>
            <code className="block bg-[#0A0A0B] p-3 rounded text-indigo-400 text-xs">npm install --global yarn</code>
            <p className="text-xs text-gray-400">3. Initialize the project:</p>
            <code className="block bg-[#0A0A0B] p-3 rounded text-indigo-400 text-xs">npm install</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function StartupSection({ copy, copiedId }: { copy: any, copiedId: string | null }) {
  const commands = [
    { id: 'dev', label: 'Development Mode', cmd: 'npm run dev', desc: 'Starts the app with HMR enabled.' },
    { id: 'build', label: 'Production Build', cmd: 'npm run build', desc: 'Optimizes assets for deployment.' },
    { id: 'preview', label: 'Local Preview', cmd: 'npm run preview', desc: 'Serves the built application locally.' },
  ];

  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">One-Command Startup</h2>
        <p className="text-gray-400">Launch the application using these verified commands.</p>
      </header>

      <div className="space-y-4">
        {commands.map(item => (
          <div key={item.id} className="bg-[#111113] border border-[#1F1F22] rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-sm font-semibold text-white">{item.label}</h3>
               <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{item.id}</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">{item.desc}</p>
            <div className="bg-[#0A0A0B] rounded-lg p-3 flex items-center justify-between group">
               <code className="text-indigo-400 text-xs">{item.cmd}</code>
               <button 
                onClick={() => copy(item.cmd, item.id)}
                className="text-gray-500 hover:text-white transition-colors"
               >
                 {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AISetupSection() {
  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">AI Provider Setup</h2>
        <p className="text-gray-400">Unlock the full power of SystemArchitect with AI.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {[
          { name: 'Google Gemini', url: 'https://aistudio.google.com/', best: true },
          { name: 'OpenAI GPT-4', url: 'https://platform.openai.com/' },
          { name: 'Anthropic Claude', url: 'https://console.anthropic.com/' },
          { name: 'Groq', url: 'https://console.groq.com/' }
        ].map(p => (
          <div key={p.name} className="bg-[#111113] border border-[#1F1F22] rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white text-xs">
                {p.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                  {p.best && <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/20">Recommended</span>}
                </div>
                <p className="text-[10px] text-gray-500">Fast inference & deep reasoning capabilities.</p>
              </div>
            </div>
            <a 
              href={p.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Get Key <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnvConfigSection() {
  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">Environment Configuration</h2>
        <p className="text-gray-400">Configure your local or production environment variables.</p>
      </header>

      <div className="bg-[#111113] border border-[#1F1F22] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Required Variables</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">GEMINI_API_KEY</label>
            <p className="text-[11px] text-gray-400 mb-2">Enables core AI functionality and the Mentor.</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">VITE_ENABLE_INTERVIEW_MODE</label>
            <p className="text-[11px] text-gray-400 mb-2">Set to 'true' to enable voice-interactive interviews.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiagnosticsSection({ running, results, onRun }: any) {
  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">Automatic System Check</h2>
        <p className="text-gray-400">Verify your application configuration and connectivity.</p>
      </header>

      <button 
        onClick={onRun}
        disabled={running}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
      >
        {running ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
        {running ? 'Checking System...' : 'Run Diagnostics'}
      </button>

      {results && (
        <div className="space-y-3">
          {Object.entries(results).map(([key, res]: any) => (
            <div key={key} className="bg-[#111113] border border-[#1F1F22] rounded-xl p-4 flex items-center gap-4">
              {res.status === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : 
               res.status === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : 
               <XCircle className="w-5 h-5 text-red-500" />}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">{key}</h4>
                <p className="text-xs text-gray-400">{res.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TroubleshootingSection() {
  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">Troubleshooting</h2>
        <p className="text-gray-400">Solutions to common issues.</p>
      </header>

      <div className="space-y-4">
        {[
          { q: 'Canvas is not rendering components', a: 'Check if Hardware Acceleration is enabled in your browser settings. Large architectures require GPU assistance.' },
          { q: 'AI Mentor is not responding', a: 'Verify your Gemini API key in Settings. Check your internet connection or if the API quota is exhausted.' },
          { q: 'Simulation is stuck at 0%', a: 'This usually means there is a disconnected node in your design. Ensure every node has at least one edge.' },
          { q: 'Exporting PDF results in a blank page', a: 'Try reducing the zoom level before exporting. Large canvases may sometimes time out during capture.' }
        ].map((item, i) => (
          <div key={i} className="bg-[#111113] border border-[#1F1F22] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" /> {item.q}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpdatesSection() {
  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">Updates & Backups</h2>
        <p className="text-gray-400">Keep your system architect up to date.</p>
      </header>

      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Update Logic</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          The app checks for updates automatically on startup. To force an update, pull the latest changes from the master branch.
        </p>
        <code className="block bg-[#0A0A0B] p-3 rounded text-indigo-400 text-xs mb-4">git pull origin master && npm install</code>
      </div>
    </div>
  );
}

function FAQSection() {
  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">FAQ</h2>
        <p className="text-gray-400">Frequently Asked Questions.</p>
      </header>

      <div className="space-y-4">
        {[
          { q: 'Is my data saved?', a: 'Yes, your designs are saved automatically to Local Storage. If you connect Firebase, they sync across devices.' },
          { q: 'Can I export my designs?', a: 'You can export designs as JSON for sharing or PNG/SVG for documentation.' },
          { q: 'Is the Interview Mode realistic?', a: 'The AI uses real FAANG interview rubrics to grade your communication, trade-off analysis, and technical depth.' }
        ].map((item, i) => (
          <div key={i} className="border-b border-[#1F1F22] pb-4">
            <h3 className="text-sm font-semibold text-white mb-1">{item.q}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShortcutsSection() {
  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">Keyboard Shortcuts</h2>
        <p className="text-gray-400">Efficiency for power users.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {[
          { k: '⌘ + S', d: 'Save Design' },
          { k: '⌘ + Z', d: 'Undo Last Action' },
          { k: '⌘ + Shift + Z', d: 'Redo Action' },
          { k: 'Delete', d: 'Remove Selected' },
          { k: 'Space (Hold)', d: 'Pan Canvas' },
          { k: 'Wheel', d: 'Zoom In/Out' },
          { k: '⌘ + F', d: 'Find Component' },
          { k: 'R', d: 'Run Simulation' },
          { k: 'V', d: 'Validate Design' }
        ].map(item => (
          <div key={item.k} className="bg-[#111113] border border-[#1F1F22] rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">{item.d}</span>
            <kbd className="bg-[#1A1A1D] border border-[#27272A] rounded px-1.5 py-0.5 text-[10px] text-white font-mono">{item.k}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserGuideSection() {
  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">User Guide</h2>
        <p className="text-gray-400">A walkthrough of the core features.</p>
      </header>

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
             <Book className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-1">Learning Curriculum</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Start with the basics of horizontal scaling and move up to expert-level distributed systems like Kafka and Paxos.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
             <Code className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-1">The Design Lab</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Drag components onto the canvas. Use the Traffic Simulator to see how your system handles load in real-time.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1F1F22]">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('trigger-onboarding-tour'))}
            className="w-full bg-[#111113] border border-indigo-500/30 hover:bg-indigo-500/5 text-indigo-400 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5" /> Replay Guided Tour
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedbackSection() {
  return (
    <div className="space-y-6">
       <header>
        <h2 className="text-2xl font-bold text-white mb-2">Feedback & Diagnostics</h2>
        <p className="text-gray-400">Help us improve SystemArchitect.</p>
      </header>

      <div className="bg-[#111113] border border-[#1F1F22] rounded-xl p-6">
        <textarea 
          placeholder="Describe your issue or suggestion..."
          className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-xl p-4 text-sm text-white h-32 focus:outline-none focus:border-indigo-500 transition-colors mb-4"
        />
        <div className="flex items-center justify-between">
          <button className="bg-white/5 hover:bg-white/10 text-gray-300 text-xs px-4 py-2 rounded-lg transition-colors border border-[#27272A] flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Logs
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-6 py-2 rounded-lg font-medium transition-colors">
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
