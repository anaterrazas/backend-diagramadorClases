"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAService = void 0;
// src/modules/ia/ia.service.ts
const ia_client_1 = require("./ia.client");
exports.IAService = {
    /**
     * Genera texto a partir de un prompt usando Gemini Pro
     */
    async generarTexto(prompt) {
        return await (0, ia_client_1.generateWithAI)({
            prompt,
            model: 'gemini-2.5-flash',
        });
    },
    /**
     * Analiza o describe una imagen con prompt opcional usando Gemini Pro Vision
     */
    async generarDesdeImagen(opciones) {
        const { imagePath, prompt = '', mimeType = 'image/png' } = opciones;
        return await (0, ia_client_1.generateWithAI)({
            prompt,
            imagePath,
            mimeType,
            model: 'gemini-2.5-flash'
        });
    },
};
