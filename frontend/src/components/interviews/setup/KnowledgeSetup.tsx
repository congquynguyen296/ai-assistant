import { useState, useEffect, useRef } from 'react';
import { Search, Flame, Loader2 } from 'lucide-react';
import { interviewService } from '@/services/interviewService';

interface KnowledgeSetupProps {
  onChange: (params: { topicName?: string }) => void;
}

export default function KnowledgeSetup({ onChange }: KnowledgeSetupProps) {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [trendingSkills, setTrendingSkills] = useState<Array<{ name: string; count: number }>>([]);
  const [searchResults, setSearchResults] = useState<Array<{ name: string; count: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const topics = await interviewService.getTrendingTopics();
        setTrendingSkills(topics.map(t => ({ name: t.name, count: t.usageCount })));
      } catch (error) {
        console.error('Failed to fetch trending topics:', error);
      } finally {
        setIsLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    // Notify parent
    onChange({ topicName: selectedSkill ? selectedSkill : undefined });
  }, [selectedSkill, onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSelectedSkill(val);
    setShowDropdown(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await interviewService.searchTopics(val);
        setSearchResults(results.map(r => ({ name: r.name, count: r.usageCount })));
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectSkill = (name: string) => {
    setSelectedSkill(name);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-3" ref={wrapperRef}>
        <label className="block text-sm font-semibold text-slate-700">Chủ đề hoặc Kỹ năng bạn muốn luyện tập</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={selectedSkill}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="VD: System Design, Kubernetes, Javascript..."
            className="w-full p-3 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
          {/* Search Dropdown */}
          {showDropdown && selectedSkill.trim() && (isSearching || searchResults.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-lg rounded-xl z-10 overflow-hidden">
              {isSearching ? (
                <div className="p-4 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                  <span className="text-sm text-slate-500">Đang tìm kiếm...</span>
                </div>
              ) : (
                <ul className="max-h-60 overflow-auto">
                  {searchResults.map((skill, idx) => (
                    <li 
                      key={idx}
                      onClick={() => handleSelectSkill(skill.name)}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-100 last:border-0"
                    >
                      <span className="font-medium text-slate-700">{skill.name}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{skill.count} lượt chọn</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {!isLoadingTrending && trendingSkills.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Kỹ năng đang thịnh hành (Trending)
          </h4>
          <div className="flex flex-wrap gap-2">
            {trendingSkills.map((skill) => (
                <button
                  key={skill.name}
                  onClick={() => handleSelectSkill(skill.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedSkill.toLowerCase() === skill.name.toLowerCase() 
                      ? 'bg-emerald-100 border-emerald-200 text-emerald-800' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {skill.name} <span className="opacity-60 ml-1">({skill.count})</span>
                </button>
            ))}
          </div>
        </div>
      )}
      {isLoadingTrending && (
        <div>
          <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Kỹ năng đang thịnh hành (Trending)
          </h4>
          <span className="text-sm text-slate-400 italic">Đang tải...</span>
        </div>
      )}
    </div>
  );
}
