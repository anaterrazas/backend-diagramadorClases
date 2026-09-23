"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flutter_codegen_controller_1 = require("./flutter-codegen.controller");
const router = (0, express_1.Router)();
router.post('/flutter', flutter_codegen_controller_1.generateFlutter);
exports.default = router;
