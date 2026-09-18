"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.importImg = exports.deleteSala = exports.updateSala = exports.createSala = exports.getSalas = void 0;
const salaService = __importStar(require("./sala.service"));
const response_1 = require("../../utils/response");
const http_error_1 = require("../../utils/http-error");
const getSalas = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new http_error_1.HttpError('Usuario no autenticado', 401);
        const salas = await salaService.getAllSalasByUser(userId);
        return (0, response_1.successResponse)(res, salas, 'Salas obtenidas');
    }
    catch (error) {
        next(error);
    }
};
exports.getSalas = getSalas;
const createSala = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new http_error_1.HttpError('Usuario no autenticado', 401);
        const { title, description } = req.body;
        const id = await salaService.createSala(title, description, userId);
        return (0, response_1.successResponse)(res, { id }, 'Sala creada', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createSala = createSala;
const updateSala = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const salaId = parseInt(req.params.id);
        await salaService.updateSala(salaId, title, description);
        return (0, response_1.successResponse)(res, null, 'Sala actualizada');
    }
    catch (error) {
        next(error);
    }
};
exports.updateSala = updateSala;
const deleteSala = async (req, res, next) => {
    try {
        const salaId = parseInt(req.params.id);
        await salaService.deleteSala(salaId);
        return (0, response_1.successResponse)(res, null, 'Sala eliminada');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSala = deleteSala;
const importImg = async (req, res, next) => {
    try {
        if (!req.file)
            throw new http_error_1.HttpError('No se envió ninguna imagen.', 400);
        const aiDesign = await salaService.generateHtmlCssFromImage(req.file);
        return (0, response_1.successResponse)(res, { aiDesign }, 'Diagrama generado con IA');
    }
    catch (error) {
        next(error);
    }
};
exports.importImg = importImg;
