import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InfluencerPromptResponse, WebsitePromptResponse, DetailLevel, AppMode } from "../types";

// --- INFLUENCER SCHEMAS ---
const influencerSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    detailed_prompt: { type: Type.STRING },
    negative_prompt: { type: Type.STRING },
    art_style: { type: Type.STRING },
    lighting: { type: Type.STRING },
    camera_settings: { type: Type.STRING },
    color_palette: { type: Type.ARRAY, items: { type: Type.STRING } },
    composition: { type: Type.STRING },
    mood: { type: Type.STRING },
  },
  required: ["subject", "detailed_prompt", "negative_prompt", "art_style", "lighting", "camera_settings", "color_palette", "composition", "mood"],
};

// --- WEBSITE SCHEMAS ---
const websiteSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    project_name: { type: Type.STRING, description: "A catchy name for the project" },
    detailed_prompt: { 
      type: Type.STRING, 
      description: "A highly detailed prompt optimized for AI coding tools like v0.dev, Lovable, or Cursor. It must describe the layout, colors, specific components (shadcn/ui), and functionality." 
    },
    ui_style: { type: Type.STRING, description: "e.g. Bento Grid, Brutalism, Clean SaaS, Dark Mode" },
    tech_stack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recommended stack e.g. React, Tailwind, Framer Motion" },
    color_palette: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hex codes or Tailwind color names" },
    sections: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of sections on the landing page" },
    target_audience: { type: Type.STRING },
  },
  required: ["project_name", "detailed_prompt", "ui_style", "tech_stack", "color_palette", "sections", "target_audience"],
};

// --- HELPER FUNCTIONS ---

const getInfluencerInstruction = (level: DetailLevel): string => {
  switch (level) {
    case 1: return "Simple realism. Natural look.";
    case 2: return "Balanced realism with camera details.";
    case 3: return "High fidelity realism. Focus on visible skin pores, skin texture, and fabric details.";
    case 4: return "EXTREME HYPER-REALISM. MUST describe microscopic details: 'visible pores', 'vellus hair' (peach fuzz), 'flyaway hairs', 'skin texture imperfections', 'slight wrinkles', 'raw photo look'.";
    default: return "High fidelity realism.";
  }
};

export const enhanceUserPrompt = async (input: string, mode: AppMode): Promise<string> => {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    const context = mode === 'influencer' 
      ? "You are a photography director. Describe physical attributes, location, and action."
      : "You are a Senior UI/UX Designer. Describe the website's purpose, target audience, key features, and visual vibe.";

    const prompt = `
      ${context}
      Rewrite the user's input into a detailed description.
      Input: "${input}"
    `;

    const response = await genAI.models.generateContent({ model, contents: prompt });
    return response.text?.trim() || input;
  } catch (error) {
    console.error("Enhance Error:", error);
    return input; 
  }
};

export const generateVisualPrompt = async (
  userInput: string, 
  detailLevel: DetailLevel = 3,
  camera?: string,
  lighting?: string
): Promise<InfluencerPromptResponse> => {
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";
  
  const detailInstruction = getInfluencerInstruction(detailLevel);
  
  let constraints = [
    `GOAL: Generate a JSON prompt for a 100% PHOTOREALISTIC AI INFLUENCER image.`,
    `SKIN TEXTURE: You MUST explicitly include terms like 'visible skin pores', 'natural skin texture', 'vellus hair' (peach fuzz), 'flyaway hairs', 'slight wrinkles', and 'natural imperfections'. AVOID plastic/smooth skin.`,
  ];

  // Specific Camera Logic
  if (camera?.includes("0.6x")) {
    constraints.push(`CAMERA STYLE: Ultra-wide angle 0.6x lens, dynamic Gen-Z perspective, distorted edges, high-angle look down or extreme close-up, wide field of view.`);
  } else if (camera?.includes("2000'ler")) {
    constraints.push(`CAMERA STYLE: 2000s mobile phone camera (Nokia style), low resolution digital artifacts, heavy digital noise, slight motion blur, pixelated texture, raw Y2K aesthetic.`);
  } else if (camera?.includes("Vintage Dijital")) {
    constraints.push(`CAMERA STYLE: Early 2010s point-and-shoot digital camera, chromatic aberration, sensor blooming, characteristic digicam color science, slightly soft edges.`);
  } else if (camera && camera !== 'Auto') {
    constraints.push(`CAMERA: Simulate exact technical specs of "${camera}".`);
  }

  // Specific Lighting Logic
  if (lighting?.includes("Nostaljik Parlaklık")) {
    constraints.push(`LIGHTING: Dreamy nostalgic glow, high-key soft lighting, ethereal bloom, warm childhood memory vibe, slightly hazy, saturated primary colors, vintage film look.`);
  } else if (lighting?.includes("Pozlanmış Flaş")) {
    constraints.push(`LIGHTING: Overexposed harsh direct flash, red-eye effect simulation, hard shadows, party photography look from the early 2000s, high contrast, washed out skin tones.`);
  } else if (lighting && lighting !== 'Auto') {
    constraints.push(`LIGHTING: Use "${lighting}".`);
  }

  const systemInstruction = `
    You are an expert Photographer for AI Models.
    1. Interpret User Input.
    2. ${detailInstruction}
    3. JSON Output.
    4. detailed_prompt keywords: 'raw photo, unedited, 8k, uhd, dslr, high texture'.
    5. If nostalgic style is requested, ensure the keywords reflect that era (e.g., 'y2k', 'digital noise', 'soft glow').
  `;

  let userContent = `User Input: "${userInput}"\n\nCONSTRAINTS:\n${constraints.join('\n- ')}`;

  const response = await genAI.models.generateContent({
    model,
    contents: userContent,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: influencerSchema,
      temperature: 0.85,
    },
  });

  if (response.text) return JSON.parse(response.text) as InfluencerPromptResponse;
  throw new Error("No response from AI");
};

export const generateWebsitePrompt = async (
  userInput: string,
  siteType: string,
  designStyle: string
): Promise<WebsitePromptResponse> => {
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are an Elite Frontend Engineer and UI/UX Designer specialized in creating prompts for AI Coding Agents (v0, Lovable, Bolt).
    
    Goal: Create a detailed prompt that will generate a stunning, modern website.
    
    Focus on:
    1. Modern Design: Shadcn UI, Tailwind CSS, Lucide Icons, Bento Grids, Glassmorphism.
    2. Layout: Responsive, clean whitespace, strong typography (Inter/Geist).
    3. Interactivity: Framer Motion animations, hover states, smooth scrolling.
    
    If 'designStyle' is provided, strictly adhere to it.
  `;

  let userContent = `
    User Idea: "${userInput}"
    Site Type: "${siteType}"
    Design Style: "${designStyle}"
    
    Generate a JSON response describing this website project. 
    The 'detailed_prompt' should be ready to copy-paste into v0.dev or Cursor Composer.
  `;

  const response = await genAI.models.generateContent({
    model,
    contents: userContent,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: websiteSchema,
      temperature: 0.7, // Lower temperature for more structured code-oriented results
    },
  });

  if (response.text) return JSON.parse(response.text) as WebsitePromptResponse;
  throw new Error("No response from AI");
};