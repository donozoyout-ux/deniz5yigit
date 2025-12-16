import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PromptResponse, DetailLevel } from "../types";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      description: "The main subject (Influencer) description.",
    },
    detailed_prompt: {
      type: Type.STRING,
      description: "The raw, photorealistic prompt for generation. MANDATORY: Focus heavily on skin texture (pores, vellus hair), imperfections, and realistic lighting. NO 'CGI' or '3D' terms.",
    },
    negative_prompt: {
      type: Type.STRING,
      description: "Terms to avoid (e.g., plastic skin, cartoon, 3d render, illustration, painting, drawing).",
    },
    art_style: {
      type: Type.STRING,
      description: "The photo aesthetic (e.g., 'Candid Instagram Shot', 'High Fashion Editorial', 'Mirror Selfie', 'Paparazzi Style').",
    },
    lighting: {
      type: Type.STRING,
      description: "Realistic lighting description.",
    },
    camera_settings: {
      type: Type.STRING,
      description: "Specific camera gear or phone model (e.g., 'iPhone 15 Pro Max', 'Sony A7R IV', 'Fujifilm X100V').",
    },
    color_palette: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Natural colors found in the photo.",
    },
    composition: {
      type: Type.STRING,
      description: "Framing and angle (e.g., 'Dutch angle', 'Eye level', 'Selfie arm visible').",
    },
    mood: {
      type: Type.STRING,
      description: "The vibe of the social media post.",
    },
  },
  required: [
    "subject",
    "detailed_prompt",
    "negative_prompt",
    "art_style",
    "lighting",
    "camera_settings",
    "color_palette",
    "composition",
    "mood",
  ],
};

const getDetailInstruction = (level: DetailLevel): string => {
  switch (level) {
    case 1:
      return "Simple realism. Just describe the person and the place naturally.";
    case 2:
      return "Balanced realism. Mention camera gear and basic skin details.";
    case 3:
      return "High fidelity realism. Focus deeply on textures, fabric details, and realistic lighting artifacts.";
    case 4:
      return "EXTREME HYPER-REALISM. Hallucinate microscopic details: skin pores, slight sweat, peach fuzz, lens dust, sensor noise, motion blur. The goal is to fool the viewer into thinking it is a real photo.";
    default:
      return "High fidelity realism.";
  }
};

export const enhanceUserPrompt = async (input: string): Promise<string> => {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    const prompt = `
      You are a photography assistant for AI Influencer creation.
      Rewrite the user's simple description of a person into a detailed physical description.
      
      Focus on:
      1. Physical attributes (Hair style/color, ethnicity, body type, clothing).
      2. Setting/Location.
      3. Doing WHAT? (Action).
      
      Keep it realistic. Do not add fantasy elements.
      Input: "${input}"
    `;

    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || input;
  } catch (error) {
    console.error("Enhance Error:", error);
    return input; 
  }
};

export const generateVisualPrompt = async (
  userInput: string, 
  style: string, // Kept for compatibility, but ignored or used as aesthetic hint
  detailLevel: DetailLevel = 3,
  camera?: string,
  lighting?: string
): Promise<PromptResponse> => {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";
    
    const detailInstruction = getDetailInstruction(detailLevel);
    
    // Strict Realism Constraints
    let constraints = [
      `GOAL: Generate a JSON prompt for a 100% PHOTOREALISTIC AI INFLUENCER image.`,
      `CRITICAL: The result must look like a RAW PHOTO taken by a real camera.`,
      `FORBIDDEN: Do NOT use words like 'render', 'artwork', 'painting', 'illustration', '3d', 'octane', 'unreal engine'.`,
      `SKIN TEXTURE: You MUST describe skin imperfections: pores, texture, moles, slight redness, veins, peach fuzz (vellus hair), oily t-zone. NO PLASTIC SKIN.`,
      `EYES: Imperfect, realistic reflections.`,
      `LIGHTING: Use terms like 'hard flash', 'direct sunlight', 'window light', 'film grain', 'iso noise'.`,
      `AESTHETIC: Make it look like a post on Instagram, TikTok, or Pinterest.`,
      `NEGATIVE PROMPT: Must include: 'cartoon, drawing, anime, 3d render, plastic skin, doll, blurred, low quality, symmetry, smooth skin'.`
    ];

    if (camera && camera !== 'Auto') {
      constraints.push(`CAMERA: Must simulate "${camera}". Mention specifics of this camera's look (e.g. if 'Phone', mention 'phone post processing', 'wide angle distortion').`);
    }

    if (lighting && lighting !== 'Auto') {
      constraints.push(`LIGHTING: Must use "${lighting}".`);
    }

    const systemInstruction = `
      You are an expert Photographer and Prompt Engineer for Realistic AI Models (Flux, Midjourney, Stable Diffusion).
      
      1. Interpret the User Input (Turkish or English).
      2. ${detailInstruction}
      3. Create a JSON response.
      4. In 'detailed_prompt', use keywords: 'raw photo, unedited, fujifilm, kodak portra, 8k, uhd, dslr, soft lighting, film grain, candid'.
      5. In 'art_style', describe the Social Media Aesthetic (e.g. 'Old Money', 'Streetwear', 'Gym Rat', 'Cozy Home').
      6. In 'detailed_prompt', describe the outfit fabrics (cotton, denim, silk) and how light hits them.
    `;

    let userContent = `User Input: "${userInput}"\n\nCONSTRAINTS:\n${constraints.join('\n- ')}`;

    const response = await genAI.models.generateContent({
      model: model,
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.85, // Higher creativity for natural details
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as PromptResponse;
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};