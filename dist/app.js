"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const orgs_1 = __importDefault(require("./routes/orgs"));
// Middleware
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// -------------------- MIDDLEWARE -------------------- //
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Basic rate-limiting: max 200 requests per minute per IP
app.use((0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
}));
// -------------------- ROUTES -------------------- //
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/orgs', orgs_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
// -------------------- ERROR HANDLER -------------------- //
app.use(errorHandler_1.errorHandler);
exports.default = app;
