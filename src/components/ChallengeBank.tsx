import React from 'react';
import { CHALLENGES } from '../data/challenges';
import { Target, ArrowRight } from 'lucide-react';

interface ChallengeBankProps {
  onSelectChallenge: (challenge: any) => void;
  onContextChange?: (ctx: any) => void;
}

export default function ChallengeBank({ onSelectChallenge, onContextChange }: ChallengeBankProps) {
  
  const onContextChangeRef = React.useRef(onContextChange);
  React.useEffect(() => {
    onContextChangeRef.current = onContextChange;
  }, [onContextChange]);

  React.useEffect(() => {
    onContextChangeRef.current?.({ topic: 'Challenge Bank' });
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-full overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Target className="w-8 h-8 text-amber-400" /> System Design Challenges
        </h2>
        <p className="text-gray-400">Test your skills by designing architectures from scratch based on specific requirements and constraints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CHALLENGES.map(challenge => (
          <div key={challenge.id} className="bg-[#111113] border border-[#27272A] hover:border-amber-500/50 rounded-2xl p-6 transition-all group flex flex-col h-full cursor-pointer" onClick={() => onSelectChallenge(challenge)}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-200 group-hover:text-amber-400 transition-colors">{challenge.title}</h3>
              <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded ${challenge.category === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' : challenge.category === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                {challenge.category}
              </span>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-1">
              {challenge.description}
            </p>

            <button className="w-full py-2.5 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              Start Challenge <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
