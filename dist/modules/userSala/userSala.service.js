"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compartirSala = compartirSala;
exports.obtenerSalasCompartidas = obtenerSalasCompartidas;
exports.eliminarSalaCompartida = eliminarSalaCompartida;
const userSala_model_1 = __importDefault(require("./userSala.model"));
const sala_model_1 = __importDefault(require("../sala/sala.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
// Crea/activa la relación de compartido
async function compartirSala(userId, salaId, t) {
    // Si el usuario es el creador, no creamos relación de compartido
    const salaDelUsuario = await sala_model_1.default.findOne({
        where: { id: salaId, user_create: userId },
        transaction: t,
    });
    if (salaDelUsuario) {
        return 'El creador ya tiene acceso';
    }
    const existente = await userSala_model_1.default.findOne({
        where: { user_id: userId, sala_id: salaId },
        transaction: t,
    });
    if (existente) {
        if (!existente.is_active) {
            existente.is_active = true;
            await existente.save({ transaction: t });
            return 'Relación activada';
        }
        return 'Ya estaba compartida';
    }
    return await userSala_model_1.default.create({ user_id: userId, sala_id: salaId, is_active: true }, { transaction: t });
}
// Lista salas compartidas con un usuario
async function obtenerSalasCompartidas(userId) {
    const filas = await userSala_model_1.default.findAll({
        where: { user_id: userId, is_active: true },
        include: [
            {
                model: sala_model_1.default,
                as: 'sala',
                attributes: ['id', 'title', 'description'],
                include: [{ model: user_model_1.default, as: 'creador', attributes: ['nombre'] }],
            },
        ],
        raw: true,
        nest: true,
    });
    // Pojo limpio para el frontend
    return filas.map((f) => ({
        id: f.sala?.id,
        title: f.sala?.title,
        description: f.sala?.description,
        creador: f.sala?.creador?.nombre,
    }));
}
// Soft delete de la relación
async function eliminarSalaCompartida(userId, salaId, t) {
    const [affected] = await userSala_model_1.default.update({ is_active: false }, { where: { user_id: userId, sala_id: salaId }, transaction: t });
    return affected > 0; // true si se desactivó
}
