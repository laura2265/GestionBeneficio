"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyRouter = void 0;
const express_1 = require("express");
const history_controller_1 = require("../controller/history.controller");
exports.historyRouter = (0, express_1.Router)();
exports.historyRouter.get('/', history_controller_1.HistoryController.list);
exports.historyRouter.post('/', history_controller_1.HistoryController.create);
exports.historyRouter.put('/:id', history_controller_1.HistoryController.update);
