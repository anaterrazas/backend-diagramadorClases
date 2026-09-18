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
exports.deleteSalaCompartida = exports.compartir = exports.indexSalasCompartidas = void 0;
const userSalaService = __importStar(require("./userSala.service"));
const response_1 = require("../../utils/response");
const http_error_1 = require("../../utils/http-error");
const indexSalasCompartidas = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new http_error_1.HttpError('Usuario no autenticado', 401);
        const salas = await userSalaService.obtenerSalasCompartidas(userId);
        return (0, response_1.successResponse)(res, salas, 'Salas compartidas obtenidas');
    }
    catch (error) {
        next(error);
    }
};
exports.indexSalasCompartidas = indexSalasCompartidas;
const compartir = async (req, res, next) => {
    try {
        console.log("ENTRO");
        const userId = req.user?.id;
        const salaId = Number(req.params.id);
        if (!userId || !salaId)
            throw new http_error_1.HttpError('Datos inválidos', 400);
        await userSalaService.compartirSala(userId, salaId);
        return (0, response_1.successResponse)(res, null, 'Sala compartida exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.compartir = compartir;
const deleteSalaCompartida = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const salaId = Number(req.params.id);
        if (!userId || !salaId)
            throw new http_error_1.HttpError('Datos inválidos', 400);
        await userSalaService.eliminarSalaCompartida(userId, salaId);
        return (0, response_1.successResponse)(res, null, 'Sala compartida eliminada');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSalaCompartida = deleteSalaCompartida;
