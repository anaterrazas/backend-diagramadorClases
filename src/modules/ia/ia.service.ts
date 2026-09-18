// src/modules/ia/ia.service.ts
import { generateWithAI } from './ia.client'

export const IAService = {
  /**
   * Genera texto a partir de un prompt usando Gemini Pro
   */
  async generarTexto(prompt: string): Promise<string> {
    return await generateWithAI({
      prompt,
      model: 'gemini-2.5-flash',
    })
  },

  /**
   * Analiza o describe una imagen con prompt opcional usando Gemini Pro Vision
   */
  async generarDesdeImagen(opciones: {
    imagePath: string
    prompt?: string
    mimeType?: string // Por defecto es image/png
  }): Promise<string> {
    const { imagePath, prompt = '', mimeType = 'image/png' } = opciones

    return await generateWithAI({
      prompt,
      imagePath,
      mimeType,
      model: 'gemini-2.5-flash'
    })
  },
}
