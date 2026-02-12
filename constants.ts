import { AgentConfig, FlowerTheme } from './types';

export const AI_MODELS = {
  gemini: [
    "gemini-2.5-flash",
    "gemini-3-flash-preview",
    "gemini-3-pro-preview",
  ],
  openai: [
    "gpt-4o",
    "gpt-4o-mini",
  ],
  anthropic: [
    "claude-3-5-sonnet-20241022",
  ],
  xai: [
    "grok-beta",
  ],
};

export const FLOWER_THEMES: FlowerTheme[] = [
  {
    id: "nordic_lotus",
    name_en: "Nordic Lotus",
    name_zh: "北境蓮華",
    primary: "#7FB3D5",
    secondary: "#F5CBA7",
    accent: "#82E0AA",
    bg: "#F4F6F7",
  },
  {
    id: "polar_rose",
    name_en: "Polar Rose",
    name_zh: "極地玫瑰",
    primary: "#EC7063",
    secondary: "#FADBD8",
    accent: "#AF7AC5",
    bg: "#FDFEFE",
  },
  {
    id: "midnight_orchid",
    name_en: "Midnight Orchid",
    name_zh: "午夜蘭花",
    primary: "#8E44AD",
    secondary: "#D2B4DE",
    accent: "#F1C40F",
    bg: "#1A1B26",
  },
  {
    id: "aurora_lily",
    name_en: "Aurora Lily",
    name_zh: "極光百合",
    primary: "#48C9B0",
    secondary: "#A3E4D7",
    accent: "#F7DC6F",
    bg: "#F0F3F4",
  }
];

export const INITIAL_AGENTS: AgentConfig[] = [
  {
    id: "classifier",
    name: "Regulatory Classifier",
    description: "Determines device classification and product code.",
    model: "gemini-3-flash-preview",
    max_tokens: 2000,
    temperature: 0.2,
    system_prompt: "You are an expert FDA Regulatory classifier. Analyze the input device description and identify the likely Regulation Number, Product Code, and Device Class.",
    provider: "gemini",
  },
  {
    id: "predicate_matcher",
    name: "Predicate Matcher",
    description: "Suggests potential predicate devices.",
    model: "gemini-3-flash-preview",
    max_tokens: 2000,
    temperature: 0.3,
    system_prompt: "You are an expert in FDA 510(k) submissions. Based on the device description and classification, suggest 3 potential predicate devices with their 510(k) numbers if known.",
    provider: "gemini",
  },
  {
    id: "risk_analyzer",
    name: "Risk Analyzer",
    description: "Identifies key risks and mitigations.",
    model: "gemini-3-flash-preview",
    max_tokens: 4000,
    temperature: 0.4,
    system_prompt: "Perform a preliminary ISO 14971 risk analysis. List top 5 hazards, foreseeable sequence of events, hazardous situations, and recommended harms/mitigations.",
    provider: "gemini",
  }
];
