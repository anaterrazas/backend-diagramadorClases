// sala.service.ts
import Sala from './sala.model';
import { Transaction } from 'sequelize';
import { OpenAI } from 'openai';
import { HttpError } from '../../utils/http-error';
import { ValidationAppError } from '../../utils/validation-error';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function getAllSalasByUser(userId: number, t?: Transaction) {
  const sala = await Sala.findAll({ where: { user_create: userId, is_active: true } });
  return sala;
}

export async function createSala(title: string, description: string, userId: number, t?: Transaction) {
  const sala = await Sala.create({ title, description, user_create: userId }, { transaction: t });
  return sala;
}

export async function updateSala(salaId: number, title: string, description: string, t?: Transaction) {
  const [affected] = await Sala.update(
    { title, description },
    { where: { id: salaId }, transaction: t }
  );
  return affected > 0; // true si actualizó
}

export async function deleteSala(salaId: number, t?: Transaction) {
  const [affected] = await Sala.update(
    { is_active: false },
    { where: { id: salaId }, transaction: t }
  );
  return affected > 0; // soft delete
}

export async function getDiagrama(salaId: number) {
  const sala = await Sala.findOne({ where: { id: salaId }, attributes: ['diagram'] });
  return sala?.diagram ?? null;
}

export async function saveDiagrama(salaId: number, diagrama: any, t?: Transaction) {
  const sala = await Sala.findByPk(salaId);
  if (!sala) return null;
  sala.diagram = diagrama;
  await sala.save({ transaction: t });
  return sala;
}


export const generateHtmlCssFromImage = async (file: Express.Multer.File) => {
  const prompt = 'Analiza esta imagen y genera el código HTML y CSS correspondiente.';
  const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }
    ],
    max_tokens: 2000,
    temperature: 0.3,
  });

  let result = completion.choices[0].message.content || '';
  if (result.startsWith('```json')) {
    result = result.replace(/^```json/, '').replace(/```$/, '').trim();
  }
  if (!result.trim().startsWith('{')) {
    throw new HttpError('OpenAI no devolvió JSON válido.', 500);
  }
  return JSON.parse(result);
};
