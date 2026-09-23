"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFlutter = generateFlutter;
const flutter_codegen_service_1 = require("./flutter-codegen.service");
async function generateFlutter(req, res) {
    const buffer = await (0, flutter_codegen_service_1.generateFlutterZip)(req.body);
    res.status(200);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="flutter-app.zip"');
    res.setHeader('Content-Length', String(buffer.length));
    res.end(buffer);
}
