"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesRouter = void 0;
const express_1 = __importStar(require("express"));
const roles_service_1 = require("../services/roles.service");
const user_roles_service_1 = require("../services/user-roles.service");
exports.rolesRouter = (0, express_1.Router)();
exports.rolesRouter.get('/', async (_req, res, next) => {
    try {
        res.json(await roles_service_1.RoleService.list());
    }
    catch (err) {
        next(express_1.default);
    }
});
exports.rolesRouter.get('/user/:userId/roleId', async (req, res, next) => {
    try {
        res.json(await user_roles_service_1.UserRoleService.listByUser(Number(req.params.userId)));
    }
    catch (err) {
        next(express_1.default);
    }
});
exports.rolesRouter.post('/user/:userId/:roleId', async (req, res, next) => {
    try {
        res.status(201).json(await user_roles_service_1.UserRoleService.assign(Number(req.params.userId), (Number(req.params.roleId))));
    }
    catch (err) {
        next(express_1.default);
    }
});
exports.rolesRouter.delete('/user/:userId/:roleId', async (req, res, next) => {
    try {
        res.json(await user_roles_service_1.UserRoleService.unassign(Number(req.params.userId), Number(req.params.roleId)));
    }
    catch (err) {
        next(express_1.default);
    }
});
