"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_1 = require("../services/users.service");
class UsersController {
    static async list(req, res, next) {
        try {
            const page = Number(req.query.page ?? 1);
            const size = Number(req.query.size ?? 10);
            const onlyActive = (req.query.onlyActive ?? 'true') === 'true';
            const result = await users_service_1.UsersService.list({ page, size, onlyActive });
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async get(req, res, next) {
        try {
            const id = Number(req.params.id);
            const result = await users_service_1.UsersService.get(id);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const result = await users_service_1.UsersService.create(req.body);
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const id = Number(req.params.id);
            const result = await users_service_1.UsersService.update(id, req.body);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async deactivate(req, res, next) {
        try {
            const id = Number(req.params.id);
            const result = await users_service_1.UsersService.deactivate(id);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UsersController = UsersController;
