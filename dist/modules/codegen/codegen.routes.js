"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/codegen/codegen.routes.ts
const express_1 = require("express");
const codegen_controller_1 = require("./codegen.controller");
const router = (0, express_1.Router)();
// POST /api/codegen/spring-boot — genera un proyecto Spring Boot y devuelve un ZIP.
router.post('/spring-boot', codegen_controller_1.generarSpringBoot);
exports.default = router;
