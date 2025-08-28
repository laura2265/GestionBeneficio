"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estratoRouter = void 0;
const express_1 = require("express");
const estrato_controller_1 = require("../controller/estrato.controller");
exports.estratoRouter = (0, express_1.Router)();
exports.estratoRouter.get('/', estrato_controller_1.EstratoController.list);
