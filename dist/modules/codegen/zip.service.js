"use strict";
// src/modules/codegen/zip.service.ts
// Empaquetado ZIP en memoria con `archiver`.
//
// Decisión: no se escriben archivos temporales en disco. Los archivos del
// proyecto se proporcionan como strings en memoria y se añaden directo al
// stream de archiver, por lo que no queda basura temporal que limpiar
// (fs-extra no es necesario para construir el ZIP).
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZipFromFiles = createZipFromFiles;
const archiver_1 = __importDefault(require("archiver"));
/** Crea una zona de archivos (nombre de entrada → contenido) como Buffer ZIP. */
function createZipFromFiles(files) {
    return new Promise((resolve, reject) => {
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        const chunks = [];
        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);
        for (const [name, content] of Object.entries(files)) {
            archive.append(Buffer.from(content, 'utf8'), { name });
        }
        archive.finalize().catch(reject);
    });
}
