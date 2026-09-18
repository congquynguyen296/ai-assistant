import React from 'react';

interface CVDeepDiveSetupProps {
  onGenerateBlueprint: () => void;
  isGenerating: boolean;
}

export default function CVDeepDiveSetup({ onGenerateBlueprint, isGenerating }: CVDeepDiveSetupProps) {
  return (
    <div className="max-w-md mx-auto space-y-3">
      <label className="block text-sm font-semibold text-slate-700">Chọn CV của bạn để phân tích sâu</label>
      <select className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
        <option value="">-- Chọn tài liệu CV --</option>
        <option value="doc1">CV_Nguyen_Van_A_Backend.pdf</option>
      </select>
    </div>
  );
}
