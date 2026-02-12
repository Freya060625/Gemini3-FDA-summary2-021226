export type Provider = 'gemini' | 'openai' | 'anthropic' | 'xai';

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  max_tokens: number;
  temperature: number;
  system_prompt: string;
  provider: Provider;
}

export interface FlowerTheme {
  id: string;
  name_en: string;
  name_zh: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
}

export interface AppState {
  language: 'en' | 'zh';
  theme_mode: 'light' | 'dark';
  current_flower_id: string;
  health: number;
  mana: number;
  experience: number;
  level: number;
}

export interface Metrics {
  total_runs: number;
  provider_calls: Record<Provider, number>;
  tokens_used: number;
  last_run_duration: number;
}

export interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'error';
  msg: string;
}
