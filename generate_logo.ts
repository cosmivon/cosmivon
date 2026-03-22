import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateLogo() {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: 'A professional, high-tech, minimalist logo for a company named "Cosmivon Technologies". The logo should feature a stylized, abstract 3D representation of a cosmic portal or a galaxy, using a sleek cyan and deep purple color palette. The design should be clean, modern, and suitable for a tech company. No text in the logo itself, just the icon.',
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      console.log("LOGO_DATA:" + part.inlineData.data);
    }
  }
}

generateLogo();
