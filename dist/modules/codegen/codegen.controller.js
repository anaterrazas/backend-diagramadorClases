"use strict";
// src/modules/codegen/codegen.controller.ts
// Controller del generador local de Spring Boot.
// POST /api/codegen/spring-boot → application/zip
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarSpringBoot = generarSpringBoot;
const codegen_service_1 = require("./codegen.service");
const zip_service_1 = require("./zip.service");
const java_name_utils_1 = require("./java-name.utils");
async function generarSpringBoot(req, res) {
    const validated = (0, codegen_service_1.validateGenerateRequest)(req.body);
    const { files, project } = (0, codegen_service_1.generateSpringBootProject)(validated);
    const buffer = await (0, zip_service_1.createZipFromFiles)(files);
    const filename = (0, java_name_utils_1.zipBaseName)(project.projectName);
    res.status(200);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', String(buffer.length));
    res.end(buffer);
}
