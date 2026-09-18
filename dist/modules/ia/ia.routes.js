"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/ia/ia.routes.ts
const express_1 = require("express");
const ia_controller_1 = require("./ia.controller");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.post('/texto', ia_controller_1.generarTextoHandler);
router.post('/imagen', upload.single('imagen'), ia_controller_1.generarDesdeImagenHandler);
exports.default = router;
