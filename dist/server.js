"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = require("./libs/prisma");
const port = Number(env_1.PORT);
app_1.default.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
    try {
        await prisma_1.prisma.$connect();
        console.log('Connected to database');
    }
    catch (err) {
        console.error('DB connection failed', err);
        process.exit(1);
    }
});
