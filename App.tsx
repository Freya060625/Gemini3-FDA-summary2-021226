import React, { useState } from 'react';
import Layout from './components/Layout';
import Pipeline from './components/Pipeline';
import FdaDeviceSummary from './components/FdaDeviceSummary';
import NoteKeeper from './components/NoteKeeper';
import Dashboard from './components/Dashboard';
import { AppState, AgentConfig, Metrics, LogEntry } from './types';
import { INITIAL_AGENTS, FLOWER_THEMES } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pipeline');
  
  const [appState, setAppState] = useState<AppState>({
    language: 'en',
    theme_mode: 'light',
    current_flower_id: FLOWER_THEMES[0].id,
    health: 100,
    mana: 100,
    experience: 0,
    level: 1
  });

  const [agents, setAgents] = useState<AgentConfig[]>(INITIAL_AGENTS);
  
  const [metrics, setMetrics] = useState<Metrics>({
    total_runs: 0,
    provider_calls: { gemini: 0, openai: 0, anthropic: 0, xai: 0 },
    tokens_used: 0,
    last_run_duration: 0
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };

  const updateMetrics = (provider: string, duration: number) => {
    setMetrics(prev => ({
      ...prev,
      total_runs: prev.total_runs + 1,
      provider_calls: {
        ...prev.provider_calls,
        [provider]: (prev.provider_calls[provider as keyof typeof prev.provider_calls] || 0) + 1
      },
      last_run_duration: duration
    }));
  };

  return (
    <Layout 
      appState={appState} 
      setAppState={setAppState}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === 'pipeline' && (
        <Pipeline 
          agents={agents}
          setAgents={setAgents}
          appState={appState}
          setAppState={setAppState}
          addLog={addLog}
          updateMetrics={updateMetrics}
        />
      )}
      
      {activeTab === 'summary' && (
        <FdaDeviceSummary 
          appState={appState}
          setAppState={setAppState}
          addLog={addLog}
        />
      )}
      
      {activeTab === 'notes' && (
        <NoteKeeper appState={appState} />
      )}
      
      {activeTab === 'dashboard' && (
        <Dashboard metrics={metrics} logs={logs} />
      )}
    </Layout>
  );
};

export default App;
