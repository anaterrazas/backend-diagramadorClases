"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHtmlCssFromImage = void 0;
exports.getAllSalasByUser = getAllSalasByUser;
exports.createSala = createSala;
exports.updateSala = updateSala;
exports.deleteSala = deleteSala;
exports.getDiagrama = getDiagrama;
exports.saveDiagrama = saveDiagrama;
// sala.service.ts
const sala_model_1 = __importDefault(require("./sala.model"));
const openai_1 = require("openai");
const http_error_1 = require("../../utils/http-error");
const openai = new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function getAllSalasByUser(userId, t) {
    const sala = await sala_model_1.default.findAll({ where: { user_create: userId, is_active: true } });
    return sala;
}
async function createSala(title, description, userId, t) {
    const sala = await sala_model_1.default.create({ title, description, user_create: userId }, { transaction: t });
    return sala;
}
async function updateSala(salaId, title, description, t) {
    const [affected] = await sala_model_1.default.update({ title, description }, { where: { id: salaId }, transaction: t });
    return affected > 0; // true si actualizó
}
async function deleteSala(salaId, t) {
    const [affected] = await sala_model_1.default.update({ is_active: false }, { where: { id: salaId }, transaction: t });
    return affected > 0; // soft delete
}
async function getDiagrama(salaId) {
    const sala = await sala_model_1.default.findOne({ where: { id: salaId }, attributes: ['diagram'] });
    return sala?.diagram ?? null;
}
async function saveDiagrama(salaId, diagrama, t) {
    const sala = await sala_model_1.default.findByPk(salaId);
    if (!sala)
        return null;
    sala.diagram = diagrama;
    await sala.save({ transaction: t });
    return sala;
}
const generateHtmlCssFromImage = async (file) => {
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
        throw new http_error_1.HttpError('OpenAI no devolvió JSON válido.', 500);
    }
    return JSON.parse(result);
};
exports.generateHtmlCssFromImage = generateHtmlCssFromImage;
