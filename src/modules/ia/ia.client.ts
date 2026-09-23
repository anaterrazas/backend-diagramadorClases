import fs from "fs";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAI_rridlJHmuPxb9-L6FidH38dqVXMX_A");

function fileToBase64(filePath: string): string {
  const image = fs.readFileSync(filePath);
  return image.toString("base64");
}

interface GenerateOptions {
  prompt?: string;
  imagePath?: string; // Ruta a imagen local
  mimeType?: string; // image/png, image/jpeg
  model?: "gemini-2.0-pro" | "gemini-2.0-vision" | "gemini-2.5-flash";
}

export async function generateWithAI({
  prompt = "",
  imagePath,
  mimeType = "image/png",
  model = "gemini-2.5-flash",
}: GenerateOptions): Promise<string> {
  const genModel = genAI.getGenerativeModel({ model });

  const parts: any[] = [];

  if (prompt) {
    parts.push({ text: prompt });
  }

  if (imagePath) {
    const base64Image = fileToBase64(imagePath);
    parts.push({
      inlineData: {
        data: base64Image,
        mimeType,
      },
    });
  }

  try {
    const result = await genModel.generateContent({
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    const response = await result.response;
    return response.text();
  } catch (err: any) {
    console.error("Error al generar con IA:", err?.message || err);
    throw new Error("Error al generar contenido con Gemini");
  }
}
