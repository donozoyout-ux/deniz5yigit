import React, { useState } from 'react';
import { PromptResponse } from '../types';

interface PromptDisplayProps {
  data: PromptResponse;
}

const FieldCopy: React.FC<{ label: string; value: string | string[] }> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const textValue = Array.isArray(value) ? value.join(', ') : value;

  const handleCopy = () => {
    navigator.clipboard.writeText(textValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4 group">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
        <button 
          onClick={handleCopy}
          className="text-xs text-brand-400 hover:text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
        >
          {copied ? (
            <span className="text-green-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Kopyalandı
            </span>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Kopyala
            </>
          )}
        </button>
      </div>
      <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50 text-slate-200 text-sm font-sans leading-relaxed">
        {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-2">
                {value.map((color, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                        <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: color }}></span>
                        {color}
                    </span>
                ))}
            </div>
        ) : (
            textValue
        )}
      </div>
    </div>
  );
};

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ data }) => {
  const [jsonCopied, setJsonCopied] = useState(false);

  const copyFullJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-800/80 px-6 py-4 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Oluşturulan Görsel Promptu
          </h2>
          <button 
            onClick={copyFullJson}
            className="text-xs font-mono bg-slate-700 hover:bg-brand-600 hover:text-white transition-colors text-slate-300 px-3 py-1.5 rounded-md flex items-center gap-2"
          >
             {jsonCopied ? (
                <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                JSON Kopyalandı
                </>
             ) : (
                <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                JSON Kopyala
                </>
             )}
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Main Prompts */}
          <div className="space-y-1">
             <FieldCopy label="Ana Prompt (Detailed)" value={data.detailed_prompt} />
             <FieldCopy label="Negatif Prompt" value={data.negative_prompt} />
             <FieldCopy label="Konu (Subject)" value={data.subject} />
          </div>

          {/* Right Column: Details */}
          <div className="space-y-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FieldCopy label="Sanat Stili" value={data.art_style} />
                 <FieldCopy label="Aydınlatma" value={data.lighting} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FieldCopy label="Kamera / Açı" value={data.camera_settings} />
                 <FieldCopy label="Mood / Atmosfer" value={data.mood} />
            </div>
             <FieldCopy label="Renk Paleti" value={data.color_palette} />
             <FieldCopy label="Kompozisyon" value={data.composition} />
          </div>
        </div>

        {/* JSON Preview Panel (Collapsed by default logic handled by CSS or separate view, but here shown as code block for enthusiasts) */}
        <div className="bg-[#0b1120] p-6 border-t border-slate-700 overflow-x-auto">
             <div className="flex items-center gap-2 mb-2">
                 <span className="w-3 h-3 rounded-full bg-red-500"></span>
                 <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                 <span className="w-3 h-3 rounded-full bg-green-500"></span>
                 <span className="text-xs text-slate-500 font-mono ml-2">raw_output.json</span>
             </div>
             <pre className="font-mono text-xs text-blue-200 leading-5">
                 {JSON.stringify(data, null, 2)}
             </pre>
        </div>
      </div>
    </div>
  );
};