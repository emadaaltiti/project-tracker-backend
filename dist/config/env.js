"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BCRYPT_SALT_ROUNDS = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT || 4000;
exports.JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3600s';
exports.BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
