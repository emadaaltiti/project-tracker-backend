"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../libs/prisma");
const env_1 = require("../config/env");
async function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ success: false, message: 'Missing authorization header' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
        return res.status(401).json({ success: false, message: 'Invalid auth format' });
    const token = parts[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user)
            return res.status(401).json({ success: false, message: 'User not found' });
        req.user = { id: user.id, organizationId: user.organizationId, email: user.email };
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}
