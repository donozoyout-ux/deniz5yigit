export interface InfluencerPromptResponse {
  subject: string;
  detailed_prompt: string;
  negative_prompt: string;
  art_style: string;
  lighting: string;
  camera_settings: string;
  color_palette: string[];
  composition: string;
  mood: string;
}

export interface WebsitePromptResponse {
  project_name: string;
  detailed_prompt: string; // Prompt for v0, Lovable, Bolt, etc.
  ui_style: string;
  tech_stack: string[]; // React, Tailwind, Lucide, Framer Motion etc.
  color_palette: string[];
  sections: string[];
  target_audience: string;
}

export type AppMode = 'influencer' | 'website';

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type DetailLevel = 1 | 2 | 3 | 4;

export interface HistoryItem {
  id: string;
  timestamp: number;
  userInput: string;
  mode: AppMode; // Distinguished mode
  style: string; // Display label (e.g. "Influencer", "SaaS Website")
  camera?: string; // Optional (Influencer only)
  lighting?: string; // Optional (Influencer only)
  siteType?: string; // Optional (Website only)
  designStyle?: string; // Optional (Website only)
  detailLevel?: DetailLevel; 
  data: InfluencerPromptResponse | WebsitePromptResponse;
}