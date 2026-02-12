import React, { useState, useEffect } from 'react';
import { AgentConfig, AppState, LogEntry, Metrics } from '../types';
import { AI_MODELS } from '../constants';
import { generateContent } from '../services/geminiService';
import { Play, RotateCw, Edit3, Eye, Settings, Sliders } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PipelineProps {
  agents: AgentConfig[];
  setAgents: React.Dispatch<React.SetStateAction<AgentConfig[]>>;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  addLog: (log: LogEntry) => void;
  updateMetrics: (provider: string, duration: number) => void;
}

const Pipeline: React.FC<PipelineProps> = ({ 
  agents, setAgents, appState, setAppState, addLog, updateMetrics 
}) => {
  const [globalInput, setGlobalInput] = useState('');
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [viewModes, setViewModes] = useState<Record<string, 'edit' | 'preview'>>({});
  const [configOpen, setConfigOpen] = useState<Record<string, boolean>>({});
  const [isRunning, setIsRunning] = useState<string | null>(null); // 'all' or agentId

  const updateAgent = (index: number, field: keyof AgentConfig, value: any) => {
    const newAgents = [...agents];
    (newAgents[index] as any)[field] = value;
    setAgents(newAgents);
  };

  const runAgent = async (agent: AgentConfig, input: string) => {
    if (appState.mana < 20) {
      addLog({ time: new Date().toLocaleTimeString(), type: 'error', msg: 'Not enough Mana (need 20)' });
      return null;
    }

    const startTime = performance.now();
    try {
      let result = '';
      if (agent.provider === 'gemini') {
        result = await generateContent(agent.model, input, agent.system_prompt, agent.temperature, agent.max_tokens);
      } else {
        // Mock for other providers as we focus on Gemini
        await new Promise(resolve => setTimeout(resolve, 1500));
        result = `[Mock Output from ${agent.provider}] Processed: ${input.substring(0, 50)}...`;
      }

      const duration = (performance.now() - startTime) / 1000;
      updateMetrics(agent.provider, duration);
      
      setAppState(prev => ({
        ...prev,
        mana: Math.max(0, prev.mana - 20),
        experience: prev.experience + 10,
        level: 1 + Math.floor((prev.experience + 10) / 100)
      }));

      addLog({ time: new Date().toLocaleTimeString(), type: 'success', msg: `Agent ${agent.name} completed.` });
      return result;

    } catch (err: any) {
      addLog({ time: new Date().toLocaleTimeString(), type: 'error', msg: `Agent ${agent.name} failed: ${err.message}` });
      return null;
    }
  };

  const handleRunAll = async () => {
    setIsRunning('all');
    let currentInput = globalInput;
    
    for (const agent of agents) {
      // Allow chaining: If user manually edited the input for this agent, use it.
      // Otherwise use previous output.
      const result = await runAgent(agent, currentInput);
      if (!result) break;
      
      setOutputs(prev => ({ ...prev, [agent.id]: result }));
      currentInput = result; // Chain forward
    }
    setIsRunning(null);
  };

  const handleRunSingle = async (agent: AgentConfig, index: number) => {
    setIsRunning(agent.id);
    // Input is either what's typed in the input box or inferred from previous agent.
    let input = globalInput;
    if (index > 0) {
      const prevAgentId = agents[index - 1].id;
      input = outputs[prevAgentId] || '';
    }

    if (!input && index > 0) {
       addLog({ time: new Date().toLocaleTimeString(), type: 'error', msg: 'No input available from previous step.' });
       setIsRunning(null);
       return;
    }

    const result = await runAgent(agent, input);
    if (result) {
      setOutputs(prev => ({ ...prev, [agent.id]: result }));
    }
    setIsRunning(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
        <label className="block text-sm font-semibold mb-2">Global Case Input</label>
        <textarea
          value={globalInput}
          onChange={(e) => setGlobalInput(e.target.value)}
          placeholder="Enter device description, indications, test summaries..."
          className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none transition-all"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleRunAll}
            disabled={!!isRunning}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--theme-primary)] text-white rounded-full font-semibold hover:brightness-110 disabled:opacity-50 transition-all shadow-lg hover:shadow-[var(--theme-primary)]/50"
          >
            {isRunning === 'all' ? <RotateCw className="animate-spin" size={18} /> : <Play size={18} />}
            Run Full Pipeline
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {agents.map((agent, index) => (
          <div key={agent.id} className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--theme-primary)] opacity-50" />
            
            <div className="flex items-start justify-between mb-4 pl-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="bg-white/10 text-xs px-2 py-0.5 rounded uppercase tracking-wider">Step {index + 1}</span>
                  {agent.name}
                </h3>
                <p className="text-sm opacity-60 mt-1">{agent.description}</p>
              </div>
              <div className="flex items-center gap-2">
                 <select 
                   value={agent.model}
                   onChange={(e) => updateAgent(index, 'model', e.target.value)}
                   className="bg-black/20 border border-white/10 rounded text-xs py-1 px-2 focus:outline-none focus:border-[var(--theme-primary)]"
                 >
                   {AI_MODELS[agent.provider].map(m => <option key={m} value={m}>{m}</option>)}
                 </select>
                 
                 <button
                    onClick={() => setConfigOpen(prev => ({...prev, [agent.id]: !prev[agent.id]}))}
                    className={`p-2 rounded-full transition-colors ${configOpen[agent.id] ? 'bg-[var(--theme-accent)] text-black' : 'bg-white/10 hover:bg-white/20'}`}
                    title="Configure Prompt"
                 >
                    <Settings size={16} />
                 </button>

                 <button
                   onClick={() => handleRunSingle(agent, index)}
                   disabled={!!isRunning}
                   className="p-2 bg-white/10 rounded-full hover:bg-[var(--theme-accent)] hover:text-black transition-colors"
                   title="Run this agent"
                 >
                   {isRunning === agent.id ? <RotateCw className="animate-spin" size={16} /> : <Play size={16} />}
                 </button>
              </div>
            </div>

            {/* Config Area - Editable */}
            {configOpen[agent.id] ? (
              <div className="pl-4 pr-4 mb-6 animate-in slide-in-from-top-2">
                 <div className="bg-black/20 rounded-lg p-4 border border-white/5 space-y-4">
                   <div>
                     <label className="block text-xs font-bold uppercase opacity-50 mb-1 flex items-center gap-2">
                        <Edit3 size={12}/> System Instruction
                     </label>
                     <textarea 
                       value={agent.system_prompt}
                       onChange={(e) => updateAgent(index, 'system_prompt', e.target.value)}
                       className="w-full h-32 bg-black/40 border border-white/10 rounded p-2 text-sm focus:border-[var(--theme-primary)] outline-none font-mono"
                       placeholder="Enter the system prompt for this agent..."
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold uppercase opacity-50 mb-1 flex items-center gap-2">
                         <Sliders size={12} /> Temperature ({agent.temperature})
                       </label>
                       <input 
                         type="range" min="0" max="1" step="0.1"
                         value={agent.temperature}
                         onChange={(e) => updateAgent(index, 'temperature', parseFloat(e.target.value))}
                         className="w-full accent-[var(--theme-primary)]"
                       />
                     </div>
                     <div>
                        <label className="block text-xs font-bold uppercase opacity-50 mb-1">Max Tokens</label>
                        <input 
                          type="number"
                          value={agent.max_tokens}
                          onChange={(e) => updateAgent(index, 'max_tokens', parseInt(e.target.value))}
                          className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm focus:border-[var(--theme-primary)] outline-none"
                        />
                     </div>
                   </div>
                 </div>
              </div>
            ) : (
              /* Read-only preview */
              <div 
                className="pl-4 grid grid-cols-2 gap-4 mb-4 opacity-50 text-xs group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[var(--theme-primary)]"
                onClick={() => setConfigOpen(prev => ({...prev, [agent.id]: true}))}
                title="Click to edit configuration"
              >
                <div className="truncate">System: {agent.system_prompt}</div>
                <div className="text-right">Max Tokens: {agent.max_tokens} | Temp: {agent.temperature}</div>
              </div>
            )}

            {/* Output Area */}
            {outputs[agent.id] && (
              <div className="mt-4 pl-4 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase opacity-70">Output</span>
                  <div className="flex bg-black/20 rounded p-1">
                    <button 
                      onClick={() => setViewModes(prev => ({...prev, [agent.id]: 'edit'}))}
                      className={`p-1 rounded ${viewModes[agent.id] !== 'preview' ? 'bg-white/20' : ''}`}
                    >
                      <Edit3 size={14}/>
                    </button>
                    <button 
                      onClick={() => setViewModes(prev => ({...prev, [agent.id]: 'preview'}))}
                      className={`p-1 rounded ${viewModes[agent.id] === 'preview' ? 'bg-white/20' : ''}`}
                    >
                      <Eye size={14}/>
                    </button>
                  </div>
                </div>
                
                {viewModes[agent.id] === 'preview' ? (
                  <div className="prose prose-invert prose-sm max-w-none bg-black/10 p-4 rounded-lg">
                    <ReactMarkdown>{outputs[agent.id]}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea 
                    value={outputs[agent.id]}
                    onChange={(e) => setOutputs(prev => ({...prev, [agent.id]: e.target.value}))}
                    className="w-full h-48 bg-black/20 border border-white/10 rounded p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pipeline;