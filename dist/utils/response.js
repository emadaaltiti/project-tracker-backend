"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fail = exports.success = void 0;
const success = (data, message = 'OK') => ({ success: true, message, data });
exports.success = success;
const fail = (message = 'Error', data) => ({ success: false, message, data });
exports.fail = fail;
