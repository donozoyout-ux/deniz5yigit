export interface PromptResponse {
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
  style: string;
  camera?: string;
  lighting?: string;
  detailLevel?: DetailLevel; // Optional for backward compatibility
  data: PromptResponse;
}