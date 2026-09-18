import React, { useState } from 'react';
import { Search, Flame } from 'lucide-react';

interface KnowledgeSetupProps {
  onGenerateBlueprint: () => void;
  isGenerating: boolean;
}

const TRENDING_SKILLS = [
  { name: 'Java Core', count: 120 },
  { name: 'ReactJS', count: 98 },
  { name: 'System Design', count: 85 },
  { name: 'Node.js', count: 76 },
  { name: 'Microservices', count: 64 },
  { name: 'Redis Caching', count: 42 },
];

export default function KnowledgeSetup({ onGenerateBlueprint, isGenerating }: KnowledgeSetupProps) {
  const [selectedSkill, setSelectedSkill] = useState('');

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">Chủ đề hoặc Kỹ năng bạn muốn luyện tập</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            placeholder="VD: System Design, Kubernetes, Javascript Event Loop..."
            className="w-full p-3 pl-10 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Kỹ năng đang thịnh hành (Trending)
        </h4>
        <div className="flex flex-wrap gap-2">
          {TRENDING_SKILLS.map((skill) => (
            <button
              key={skill.name}
              onClick={() => setSelectedSkill(skill.name)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedSkill === skill.name 
                  ? 'bg-emerald-100 border-emerald-200 text-emerald-800' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {skill.name} <span className="opacity-60 ml-1">({skill.count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
