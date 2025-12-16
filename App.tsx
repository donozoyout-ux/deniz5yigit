import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { PromptDisplay } from './components/PromptDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { generateVisualPrompt, generateWebsitePrompt, enhanceUserPrompt } from './services/geminiService';
import { 
  InfluencerPromptResponse, 
  WebsitePromptResponse, 
  GenerationStatus, 
  HistoryItem, 
  DetailLevel, 
  AppMode 
} from './types';

// --- DATA CONSTANTS ---

// Influencer Constants
const CAMERA_OPTIONS = [
  "Auto", "iPhone 15 Pro Max", "Sony A7R IV", "Ayna Selfiesi", 
  "Fujifilm X100V", "Canon EOS R5", "CCTV", "Polaroid", "GoPro"
];
const LIGHTING_OPTIONS = [
  "Auto", "Doğal Pencere", "Altın Saat", "Sert Flaş", 
  "Halka Işık", "Loş/Moody", "Neon", "Stüdyo Softbox"
];

// Website Constants
const SITE_TYPES = [
  "Landing Page", "SaaS Dashboard", "E-Ticaret", "Portfolio", 
  "Blog", "AI Tool Interface", "Mobile App Landing", "Corporate", "NFT Marketplace"
];
const SITE_STYLES = [
  "Modern & Clean", "Dark Mode & Neon", "Bento Grid", "Brutalist", 
  "Minimalist", "Corporate Blue", "Playful & Colorful", "Glassmorphism"
];

const DETAIL_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: "Doğal", desc: "Sade" },
  2: { label: "Fotoğrafik", desc: "Kamera+" },
  3: { label: "Yüksek", desc: "Doku+" },
  4: { label: "Ultra", desc: "Raw" }
};

const App: React.FC = () => {
  // State
  const [mode, setMode] = useState<AppMode>('influencer');
  const [inputText, setInputText] = useState('');
  
  // Influencer State
  const [selectedCamera, setSelectedCamera] = useState('Auto');
  const [selectedLighting, setSelectedLighting] = useState('Auto');
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(3);
  
  // Website State
  const [selectedSiteType, setSelectedSiteType] = useState('Landing Page');
  const [selectedSiteStyle, setSelectedSiteStyle] = useState('Modern & Clean');

  // Common State
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [result, setResult] = useState<InfluencerPromptResponse | WebsitePromptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('prompt_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('prompt_history', JSON.stringify(history));
  }, [history]);

  const handleEnhance = async () => {
    if (!inputText.trim()) return;
    setIsEnhancing(true);
    try {
      const enhancedText = await enhanceUserPrompt(inputText, mode);
      setInputText(enhancedText);
    } catch (err) {
      console.error("Enhance failed", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setResult(null);

    try {
      let data;
      if (mode === 'influencer') {
        data = await generateVisualPrompt(inputText, detailLevel, selectedCamera, selectedLighting);
      } else {
        data = await generateWebsitePrompt(inputText, selectedSiteType, selectedSiteStyle);
      }
      
      setResult(data);
      setStatus(GenerationStatus.SUCCESS);

      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        userInput: inputText,
        mode: mode,
        style: mode === 'influencer' ? 'Influencer' : 'Website',
        camera: mode === 'influencer' ? selectedCamera : undefined,
        lighting: mode === 'influencer' ? selectedLighting : undefined,
        siteType: mode === 'website' ? selectedSiteType : undefined,
        designStyle: mode === 'website' ? selectedSiteStyle : undefined,
        detailLevel: mode === 'influencer' ? detailLevel : undefined,
        data: data
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (err) {
      console.error(err);
      setError('Bir hata oluştu. Lütfen tekrar deneyiniz.');
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) handleGenerate();
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setMode(item.mode);
    setInputText(item.userInput);
    
    if (item.mode === 'influencer') {
      setSelectedCamera(item.camera || 'Auto');
      setSelectedLighting(item.lighting || 'Auto');
      setDetailLevel(item.detailLevel || 3);
    } else {
      setSelectedSiteType(item.siteType || 'Landing Page');
      setSelectedSiteStyle(item.designStyle || 'Modern & Clean');
    }

    setResult(item.data);
    setStatus(GenerationStatus.SUCCESS);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    if (window.confirm("Tüm geçmişi silmek istediğine emin misin?")) setHistory([]);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-rose-500/30 selection:text-rose-200 font-sans">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full blur-[150px] transition-colors duration-700 ${mode === 'influencer' ? 'bg-rose-900/10' : 'bg-blue-900/10'}`}></div>
      </div>

      <HistorySidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        history={history}
        onSelect={handleHistorySelect}
        onClear={handleClearHistory}
        onDelete={handleDeleteItem}
      />

      <div className="relative z-10 container mx-auto px-4 py-6 flex flex-col items-center gap-6 max-w-4xl">
        
        {/* Header & Tabs */}
        <div className="w-full space-y-4 mb-2">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500 ${mode === 'influencer' ? 'bg-gradient-to-br from-rose-600 to-rose-800 shadow-rose-600/20' : 'bg-gradient-to-br from-blue-600 to-blue-800 shadow-blue-600/20'}`}>
                        {mode === 'influencer' ? (
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        ) : (
                           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                        )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg tracking-tight text-white leading-none">AI Studio</span>
                      <span className={`text-[10px] font-mono tracking-wider transition-colors ${mode === 'influencer' ? 'text-rose-400' : 'text-blue-400'}`}>
                        {mode === 'influencer' ? 'INFLUENCER EDITION' : 'WEB BUILDER'}
                      </span>
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] border border-[#222] text-gray-400 hover:text-white hover:border-gray-600 transition-all text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Geçmiş</span>
                </button>
            </div>

            {/* TABS SWITCHER */}
            <div className="flex p-1 bg-[#111] rounded-xl border border-[#222] w-full max-w-sm mx-auto">
               <button 
                  onClick={() => setMode('influencer')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'influencer' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
               >
                  Influencer
               </button>
               <button 
                  onClick={() => setMode('website')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'website' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
               >
                  Website
               </button>
            </div>
        </div>

        {/* Input Section */}
        <div className={`w-full bg-[#0f0f0f] border p-1.5 rounded-3xl shadow-2xl transition-all group ${mode === 'influencer' ? 'border-[#222] focus-within:border-rose-500/30' : 'border-[#222] focus-within:border-blue-500/30'}`}>
          <div className="relative">
            <textarea
              className="w-full bg-[#0a0a0a] text-lg text-gray-100 placeholder-gray-700 p-6 min-h-[140px] resize-none focus:outline-none rounded-2xl transition-all font-light leading-relaxed"
              placeholder={mode === 'influencer' 
                ? "Influencer'ı tanımla: 'Milano sokaklarında kahve içen, üzerinde bej trençkot olan...'" 
                : "Web sitesini tanımla: 'Yapay zeka araçları satan bir SaaS platformu, modern ve karanlık tema...'"}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === GenerationStatus.LOADING}
            />
            
            <div className="absolute bottom-4 left-4 z-10">
              <button
                onClick={handleEnhance}
                disabled={!inputText.trim() || isEnhancing || status === GenerationStatus.LOADING}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151515] border border-[#333] text-gray-400 text-xs font-semibold transition-all ${mode === 'influencer' ? 'hover:border-rose-500/50 hover:text-rose-400' : 'hover:border-blue-500/50 hover:text-blue-400'}`}
              >
                {isEnhancing ? (
                   <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                )}
                Detaylandır
              </button>
            </div>
          </div>
          
          <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Conditional Inputs based on Mode */}
            {mode === 'influencer' ? (
              <div className="col-span-1 md:col-span-8 grid grid-cols-2 gap-3">
                 <div className="flex flex-col gap-1">
                  <select 
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      disabled={status === GenerationStatus.LOADING}
                      className="bg-[#151515] text-gray-300 text-xs rounded-lg border border-[#333] px-3 py-2.5 outline-none focus:border-rose-600 appearance-none cursor-pointer hover:bg-[#1a1a1a]"
                  >
                      {CAMERA_OPTIONS.map(cam => <option key={cam} value={cam}>{cam}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <select 
                      value={selectedLighting}
                      onChange={(e) => setSelectedLighting(e.target.value)}
                      disabled={status === GenerationStatus.LOADING}
                      className="bg-[#151515] text-gray-300 text-xs rounded-lg border border-[#333] px-3 py-2.5 outline-none focus:border-rose-600 appearance-none cursor-pointer hover:bg-[#1a1a1a]"
                  >
                      {LIGHTING_OPTIONS.map(light => <option key={light} value={light}>{light}</option>)}
                  </select>
                </div>
              </div>
            ) : (
               <div className="col-span-1 md:col-span-8 grid grid-cols-2 gap-3">
                 <div className="flex flex-col gap-1">
                  <select 
                      value={selectedSiteType}
                      onChange={(e) => setSelectedSiteType(e.target.value)}
                      disabled={status === GenerationStatus.LOADING}
                      className="bg-[#151515] text-gray-300 text-xs rounded-lg border border-[#333] px-3 py-2.5 outline-none focus:border-blue-600 appearance-none cursor-pointer hover:bg-[#1a1a1a]"
                  >
                      {SITE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <select 
                      value={selectedSiteStyle}
                      onChange={(e) => setSelectedSiteStyle(e.target.value)}
                      disabled={status === GenerationStatus.LOADING}
                      className="bg-[#151515] text-gray-300 text-xs rounded-lg border border-[#333] px-3 py-2.5 outline-none focus:border-blue-600 appearance-none cursor-pointer hover:bg-[#1a1a1a]"
                  >
                      {SITE_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="col-span-1 md:col-span-4 flex gap-2">
                 <div className="flex-1">
                   <Button 
                      onClick={handleGenerate} 
                      isLoading={status === GenerationStatus.LOADING}
                      disabled={!inputText.trim()}
                      className={`w-full text-white border-0 shadow-lg ${mode === 'influencer' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'}`}
                   >
                      Oluştur
                   </Button>
                 </div>
                 
                 {/* Only show detail level for Influencer mode */}
                 {mode === 'influencer' && (
                   <div className="flex flex-col justify-center gap-1 items-center px-2" title={`Detay: ${DETAIL_LABELS[detailLevel].label}`}>
                      {[4, 3, 2, 1].map((level) => (
                          <button 
                              key={level}
                              onClick={() => setDetailLevel(level as DetailLevel)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${detailLevel >= level ? 'bg-rose-500' : 'bg-[#333] hover:bg-gray-500'}`}
                          />
                      ))}
                   </div>
                 )}
            </div>
          </div>
        </div>

        {status === GenerationStatus.ERROR && error && (
          <div className="w-full bg-red-900/20 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl text-center text-sm">
             {error}
          </div>
        )}

        {status === GenerationStatus.SUCCESS && result && (
          <PromptDisplay data={result} />
        )}
      </div>
    </div>
  );
};

export default App;