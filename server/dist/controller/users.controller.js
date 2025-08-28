import { UsersService } from "../services/users.service.js";
export class UsersController {
    static async list(req, res, next) {
        try {
            const page = Number(req.query.page ?? 1);
            const size = Number(req.query.size ?? 10);
            const onlyActive = (req.query.onlyActive ?? 'true') === 'true';
            const result = await UsersService.list({ page, size, onlyActive });
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async get(req, res, next) {
        try {
            const id = Number(req.params.id);
            const result = await UsersService.get(id);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const result = await UsersService.create(req.body);
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const id = Number(req.params.id);
            const result = await UsersService.update(id, req.body);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async deactivate(req, res, next) {
        try {
            const id = Number(req.params.id);
            const result = await UsersService.deactivate(id);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
}
