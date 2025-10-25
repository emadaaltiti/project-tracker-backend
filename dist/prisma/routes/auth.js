"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const src_1 = require("../src");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../src/config/env");
const zod_1 = require("zod");
const response_1 = require("../../src/utils/response");
const router = (0, express_1.Router)();
const signUpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional(),
    organizationName: zod_1.z.string().min(1)
});
router.post('/signup', async (req, res) => {
    try {
        const parsed = signUpSchema.parse(req.body);
        // create organization + user atomically
        const existing = await src_1.prisma.user.findUnique({ where: { email: parsed.email } });
        if (existing)
            return res.status(400).json((0, response_1.fail)('Email already in use'));
        const org = await src_1.prisma.organization.create({ data: { name: parsed.organizationName } });
        const hash = await bcrypt_1.default.hash(parsed.password, env_1.BCRYPT_SALT_ROUNDS);
        const user = await src_1.prisma.user.create({
            data: {
                email: parsed.email,
                passwordHash: hash,
                name: parsed.name,
                organizationId: org.id
            }
        });
        const token = jsonwebtoken_1.default.sign({ sub: user.id, org: org.id }, env_1.JWT_SECRET, { expiresIn: env_1.JWT_EXPIRES_IN });
        res.json((0, response_1.success)({ token, user: { id: user.id, email: user.email, organizationId: org.id } }, 'Signed up'));
    }
    catch (err) {
        return res.status(400).json((0, response_1.fail)(err instanceof Error ? err.message : 'Invalid input'));
    }
});
const loginSchema = zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(1) });
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await src_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json((0, response_1.fail)('Invalid credentials'));
        const ok = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(401).json((0, response_1.fail)('Invalid credentials'));
        const token = jsonwebtoken_1.default.sign({ sub: user.id, org: user.organizationId }, env_1.JWT_SECRET, { expiresIn: env_1.JWT_EXPIRES_IN });
        res.json((0, response_1.success)({ token, user: { id: user.id, email: user.email, organizationId: user.organizationId } }, 'Logged in'));
    }
    catch (err) {
        res.status(400).json((0, response_1.fail)(err instanceof Error ? err.message : 'Invalid input'));
    }
});
exports.default = router;
