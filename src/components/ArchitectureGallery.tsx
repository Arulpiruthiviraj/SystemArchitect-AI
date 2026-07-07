import React from 'react';
import { ARCHITECTURE_GALLERY } from '../data/architectures';
import { Layers, ArrowRight } from 'lucide-react';

interface ArchitectureGalleryProps {
  onSelectArchitecture: (arch: any) => void;
  onContextChange?: (ctx: any) => void;
}

export default function ArchitectureGallery({ onSelectArchitecture, onContextChange }: ArchitectureGalleryProps) {
  
  const onContextChangeRef = React.useRef(onContextChange);
  React.useEffect(() => {
    onContextChangeRef.current = onContextChange;
  }, [onContextChange]);

  React.useEffect(() => {
    onContextChangeRef.current?.({ topic: 'Architecture Gallery' });
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-full overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Layers className="w-8 h-8 text-indigo-400" /> Reference Architectures
        </h2>
        <p className="text-gray-400">Explore professionally designed distributed systems. Open them in the Lab to edit, simulate, and learn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARCHITECTURE_GALLERY.map(arch => (
          <div key={arch.id} className="bg-[#111113] border border-[#27272A] hover:border-indigo-500/50 rounded-2xl p-6 transition-all group flex flex-col h-full cursor-pointer" onClick={() => onSelectArchitecture(arch)}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-200 group-hover:text-indigo-400 transition-colors">{arch.title}</h3>
              <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded ${arch.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' : arch.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                {arch.difficulty}
              </span>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-1">
              {arch.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {arch.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-[#1A1A1D] border border-[#27272A] text-gray-300 text-xs rounded-md">
                  {tag}
                </span>
              ))}
            </div>

            <button className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              Open in Lab <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
