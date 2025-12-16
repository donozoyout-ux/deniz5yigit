import React from 'react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect, 
  onClear,
  onDelete 
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Geçmiş
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="text-center text-slate-500 py-10">
                <p>Henüz kayıtlı prompt yok.</p>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-brand-500/30 rounded-xl p-4 cursor-pointer transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-brand-400 bg-brand-900/30 px-2 py-0.5 rounded border border-brand-500/20">
                      {item.style}
                    </span>
                    <button 
                      onClick={(e) => onDelete(item.id, e)}
                      className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                  <p className="text-slate-200 text-sm line-clamp-2 font-medium mb-2">
                    {item.userInput}
                  </p>
                  <div className="text-[10px] text-slate-500 flex justify-between items-center">
                    <span>{new Date(item.timestamp).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {history.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
              <button 
                onClick={onClear}
                className="w-full py-2 px-4 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Tüm Geçmişi Temizle
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};