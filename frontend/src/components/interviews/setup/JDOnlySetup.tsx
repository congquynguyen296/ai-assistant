import { useState, useEffect } from 'react';
import { FileText, AlignLeft } from 'lucide-react';
import documentService from '@/services/documentService';
import type { Document } from '@/types/models';

interface JDOnlySetupProps {
  onChange: (params: { documentIds?: string[]; customText?: string }) => void;
}

export default function JDOnlySetup({ onChange }: JDOnlySetupProps) {
  const [jdMode, setJdMode] = useState<'select' | 'paste'>('select');

  const [jdDocId, setJdDocId] = useState('');
  const [jdText, setJdText] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await documentService.getDocuments();
        if (response && response.data && response.data.documents) {
          setDocuments(response.data.documents);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    const documentIds: string[] = [];
    if (jdMode === 'select' && jdDocId) documentIds.push(jdDocId);

    let customText = '';
    if (jdMode === 'paste' && jdText) customText += `--- JD ---\n${jdText}\n\n`;

    onChange({
      documentIds: documentIds.length > 0 ? documentIds : undefined,
      customText: customText ? customText : undefined,
    });
  }, [jdMode, jdDocId, jdText, onChange]);

  return (
    <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <label className="block text-base font-semibold text-slate-800">Job Description (JD)</label>
      
      {/* Toggle Modes */}
      <div className="flex flex-col sm:flex-row bg-slate-100 p-1 rounded-xl gap-1 sm:gap-0">
        <button
          onClick={() => setJdMode('select')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${jdMode === 'select' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FileText className="w-4 h-4" /> Chọn tài liệu
        </button>
        <button
          onClick={() => setJdMode('paste')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${jdMode === 'paste' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <AlignLeft className="w-4 h-4" /> Dán Text
        </button>
      </div>

      {/* Inputs */}
      <div className="mt-4">
        {jdMode === 'select' && (
          <select 
            value={jdDocId}
            onChange={(e) => setJdDocId(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          >
            <option value="">-- Chọn tài liệu có sẵn --</option>
            {documents.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.title || doc.fileName}
              </option>
            ))}
          </select>
        )}

        {jdMode === 'paste' && (
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Dán toàn bộ nội dung JD vào đây..."
            className="w-full h-40 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
          />
        )}
      </div>
    </div>
  );
}
