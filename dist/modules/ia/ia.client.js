"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWithAI = generateWithAI;
const fs_1 = __importDefault(require("fs"));
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log(process.env.GEMINI_API_KEY);
console.log(process.env.GEMINI_API_KEY);
console.log(process.env.GEMINI_API_KEY);
function fileToBase64(filePath) {
    const image = fs_1.default.readFileSync(filePath);
    return image.toString("base64");
}
async function generateWithAI({ prompt = "", imagePath, mimeType = "image/png", model = "gemini-2.5-flash", }) {
    const genModel = genAI.getGenerativeModel({ model });
    const parts = [];
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
    }
    catch (err) {
        console.error("Error al generar con IA:", err?.message || err);
        throw new Error("Error al generar contenido con Gemini");
    }
}
