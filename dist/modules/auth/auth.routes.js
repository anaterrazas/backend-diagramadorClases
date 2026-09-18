"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_validator_1 = require("./auth.validator");
const validate_1 = require("../../middlewares/validate");
const router = (0, express_1.Router)();
router.post('/login', auth_validator_1.signInValidator, validate_1.validateRequest, auth_controller_1.login);
router.post('/register', auth_validator_1.signUpValidator, validate_1.validateRequest, auth_controller_1.register);
router.post('/logout', auth_controller_1.logout); // simbólico, ya que JWT es stateless
router.post('/refresh-token', auth_controller_1.refreshToken);
exports.default = router;
