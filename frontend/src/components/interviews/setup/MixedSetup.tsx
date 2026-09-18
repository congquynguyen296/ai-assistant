import React from 'react';
import { Construction } from 'lucide-react';

export default function MixedSetup() {
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Construction className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-700 mb-2">Tính năng đang phát triển</h3>
      <p className="text-slate-500 text-sm">
        Chế độ Mixed Interview (Tổng hợp toàn diện) với độ khó cực cao đang được hoàn thiện. Vui lòng thử lại sau!
      </p>
    </div>
  );
}
