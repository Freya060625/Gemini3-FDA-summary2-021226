import React, { useState } from 'react';
import { AppState, LogEntry } from '../types';
import { generateContent } from '../services/geminiService';
import { Sparkles, Save, RotateCcw, MessageSquare, Settings, Sliders } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  addLog: (log: LogEntry) => void;
}

const DEFAULT_SYSTEM_PROMPT = "You are a senior FDA Regulatory Affairs expert.";
const DEFAULT_TEMPLATE = `Requirements:
1. Length: Approximately 2000-3000 words.
2. Format: Structured Markdown.
3. Content:
   - Intended Use & Indications for Use
   - Regulatory Classification (Product Code, Regulation Number, Class)
   - Comprehensive Risk Analysis (ISO 14971 perspective)
   - Substantial Equivalence discussion
   - Biocompatibility & Performance Testing requirements
4. Tables: Include exactly 3 distinct tables (e.g., Predicate Comparison, Risk Table, Standards List).
5. Ending: Conclude with a section titled "Follow-up Questions" containing exactly 20 distinct questions relevant to the submission strategy.`;

const FdaDeviceSummary: React.FC<Props> = ({ appState, setAppState, addLog }) => {
  const [deviceName, setDeviceName] = useState('');
  const [deviceDesc, setDeviceDesc] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState('gemini-3-flash-preview');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  
  // Prompt Customization State
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_TEMPLATE);

  // Refinement chat state
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleGenerate = async () => {
    if (!deviceName || !deviceDesc) {
      addLog({ time: new Date().toLocaleTimeString(), type: 'error', msg: 'Device name and description required.' });
      return;
    }
    if (appState.mana < 50) {
      addLog({ time: new Date().toLocaleTimeString(), type: 'error', msg: 'Need 50 Mana for deep summary.' });
      return;
    }

    setIsGenerating(true);
    
    // Construct the full prompt using the customizable template
    const userPrompt = `
      Create a comprehensive FDA regulatory summary for the following device:
      
      Device Name: ${deviceName}
      Description: ${deviceDesc}
      
      ${promptTemplate}
    `;

    try {
      const result = await generateContent(model, userPrompt, systemPrompt, 0.4, 8000);
      setGeneratedSummary(result);
      
      setAppState(prev => ({
        ...prev,
        mana: Math.max(0, prev.mana - 50),
        experience: prev.experience + 50,
        level: 1 + Math.floor((prev.experience + 50) / 100)
      }));
      addLog({ time: new Date().toLocaleTimeString(), type: 'success', msg: 'Device summary generated successfully.' });
    } catch (error: any) {
      addLog({ time: new Date().toLocaleTimeString(), type: 'error', msg: `Generation failed: ${error.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!generatedSummary || !refinePrompt) return;
    setIsRefining(true);
    
    try {
      const prompt = `
        Current Document:
        ${generatedSummary}
        
        User Instruction: ${refinePrompt}
        
        Please rewrite the document or specific sections to address the user instruction. Return the full updated markdown.
      `;
      
      const result = await generateContent(model, prompt, "You are an expert editor.", 0.3, 8000);
      setGeneratedSummary(result);
      setRefinePrompt('');
      addLog({ time: new Date().toLocaleTimeString(), type: 'success', msg: 'Summary refined.' });
    } catch (error: any) {
      addLog({ time: new Date().toLocaleTimeString(), type: 'error', msg: `Refinement failed: ${error.message}` });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      
      {/* Input Panel */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2"><Sparkles className="text-[var(--theme-accent)]" size={20} /> Device Details</span>
            <button 
               onClick={() => setShowSettings(!showSettings)}
               className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-[var(--theme-accent)] text-black' : 'bg-white/10 hover:bg-white/20'}`}
               title="Advanced Prompt Settings"
            >
               <Settings size={16} />
            </button>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-semibold opacity-60 mb-1">Device Name</label>
              <input 
                type="text" 
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded p-2 focus:ring-1 focus:ring-[var(--theme-primary)] outline-none"
                placeholder="e.g. NeuroStim Pro X1"
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase font-semibold opacity-60 mb-1">Description</label>
              <textarea 
                value={deviceDesc}
                onChange={(e) => setDeviceDesc(e.target.value)}
                className="w-full h-32 bg-black/20 border border-white/10 rounded p-2 focus:ring-1 focus:ring-[var(--theme-primary)] outline-none resize-none"
                placeholder="Describe mechanism of action, patient population, etc."
              />
            </div>

            {/* Advanced Settings */}
            {showSettings && (
              <div className="bg-black/20 rounded-lg p-3 border border-white/5 space-y-3 animate-in slide-in-from-top-2">
                 <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-50">
                    <Sliders size={12}/> Advanced Prompting
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-bold uppercase opacity-50 mb-1">System Instruction</label>
                    <textarea 
                       value={systemPrompt}
                       onChange={(e) => setSystemPrompt(e.target.value)}
                       className="w-full h-16 bg-black/40 border border-white/10 rounded p-2 text-xs focus:border-[var(--theme-primary)] outline-none font-mono"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-bold uppercase opacity-50 mb-1">Prompt Template</label>
                    <textarea 
                       value={promptTemplate}
                       onChange={(e) => setPromptTemplate(e.target.value)}
                       className="w-full h-32 bg-black/40 border border-white/10 rounded p-2 text-xs focus:border-[var(--theme-primary)] outline-none font-mono"
                       placeholder="Requirements and structure..."
                    />
                 </div>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase font-semibold opacity-60 mb-1">Model</label>
              <select 
                 value={model}
                 onChange={(e) => setModel(e.target.value)}
                 className="w-full bg-black/20 border border-white/10 rounded p-2 outline-none"
              >
                <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-[var(--theme-primary)] text-white font-bold rounded-lg shadow-lg hover:brightness-110 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
              {isGenerating ? <RotateCcw className="animate-spin" /> : <Sparkles />}
              Generate Summary (50 Mana)
            </button>
          </div>
        </div>

        {/* Refinement Panel (Visible only when summary exists) */}
        {generatedSummary && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex-1 flex flex-col">
             <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
               <MessageSquare size={16}/> Refine Output
             </h3>
             <textarea 
               value={refinePrompt}
               onChange={(e) => setRefinePrompt(e.target.value)}
               placeholder="e.g. 'Expand on the predicate comparison table' or 'Make the tone more formal'"
               className="w-full flex-1 bg-black/20 border border-white/10 rounded p-2 text-sm mb-2 resize-none outline-none focus:border-[var(--theme-accent)]"
             />
             <button
               onClick={handleRefine}
               disabled={isRefining}
               className="w-full py-2 bg-white/10 hover:bg-[var(--theme-accent)] hover:text-black rounded transition-colors text-sm font-semibold"
             >
               {isRefining ? 'Refining...' : 'Apply Refinement'}
             </button>
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-xl flex flex-col overflow-hidden h-full">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
           <h3 className="font-semibold">Comprehensive Summary</h3>
           <div className="flex bg-black/30 rounded p-1">
              <button 
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'edit' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Markdown Source
              </button>
              <button 
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'preview' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Preview
              </button>
           </div>
        </div>
        
        <div className="flex-1 overflow-auto p-0">
           {!generatedSummary && !isGenerating && (
             <div className="h-full flex flex-col items-center justify-center opacity-30">
                <FileTextIcon size={64} />
                <p className="mt-4">Enter details and generate to see summary</p>
             </div>
           )}
           
           {isGenerating && (
             <div className="h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-[var(--theme-accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="animate-pulse">Consulting FDA Database...</p>
             </div>
           )}

           {generatedSummary && viewMode === 'preview' && (
             <div className="prose prose-invert prose-lg max-w-none p-8">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedSummary}</ReactMarkdown>
             </div>
           )}

           {generatedSummary && viewMode === 'edit' && (
             <textarea 
               value={generatedSummary}
               onChange={(e) => setGeneratedSummary(e.target.value)}
               className="w-full h-full bg-[#1e1e1e] text-gray-300 p-6 font-mono text-sm resize-none focus:outline-none"
             />
           )}
        </div>
      </div>
    </div>
  );
};

const FileTextIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export default FdaDeviceSummary;