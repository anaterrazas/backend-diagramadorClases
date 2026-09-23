"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Importar rutas de módulos
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const sala_routes_1 = __importDefault(require("../modules/sala/sala.routes"));
const userSala_routes_1 = __importDefault(require("../modules/userSala/userSala.routes"));
const ia_routes_1 = __importDefault(require("../modules/ia/ia.routes"));
const codegen_routes_1 = __importDefault(require("../modules/codegen/codegen.routes"));
const flutter_codegen_routes_1 = __importDefault(require("../modules/flutter-codegen/flutter-codegen.routes"));
const authenticate_middleware_1 = require("../middlewares/authenticate.middleware");
// Agrega aquí más rutas según crezcas
const router = (0, express_1.Router)();
// Prefijos por módulo
router.use('/auth', auth_routes_1.default); // /api/auth/*
router.use('/salas', authenticate_middleware_1.authenticateJWT, sala_routes_1.default); // /api/salas/*
router.use('/user-salas', authenticate_middleware_1.authenticateJWT, userSala_routes_1.default);
router.use('/ia', ia_routes_1.default);
router.use('/codegen', codegen_routes_1.default);
router.use('/codegen', flutter_codegen_routes_1.default);
exports.default = router;
