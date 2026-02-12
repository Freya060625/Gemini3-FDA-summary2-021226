import React from 'react';
import { Metrics, LogEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  metrics: Metrics;
  logs: LogEntry[];
}

const Dashboard: React.FC<Props> = ({ metrics, logs }) => {
  const chartData = Object.entries(metrics.provider_calls).map(([key, value]) => ({
    name: key,
    calls: value
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
           <div className="text-2xl font-bold">{metrics.total_runs}</div>
           <div className="text-xs uppercase opacity-50">Total Pipeline Runs</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
           <div className="text-2xl font-bold">{metrics.provider_calls.gemini}</div>
           <div className="text-xs uppercase opacity-50">Gemini Calls</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
           <div className="text-2xl font-bold text-[var(--theme-accent)]">{metrics.last_run_duration.toFixed(2)}s</div>
           <div className="text-xs uppercase opacity-50">Last Latency</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
           <div className="text-2xl font-bold">100%</div>
           <div className="text-xs uppercase opacity-50">Uptime</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl h-80">
          <h3 className="font-bold mb-4">Provider Usage</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1B26', borderColor: '#333' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="calls" fill="var(--theme-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Logs */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl h-80 overflow-hidden flex flex-col">
          <h3 className="font-bold mb-4">Execution Log</h3>
          <div className="overflow-y-auto space-y-2 flex-1 pr-2 text-sm font-mono">
            {logs.slice().reverse().map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="opacity-40">{log.time}</span>
                <span className={
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' : 'text-blue-300'
                }>{log.msg}</span>
              </div>
            ))}
            {logs.length === 0 && <div className="opacity-30 italic">No logs yet...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
