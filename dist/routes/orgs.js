"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../libs/prisma");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/me', async (req, res) => {
    const org = await prisma_1.prisma.organization.findUnique({ where: { id: req.user.organizationId } });
    res.json((0, response_1.success)(org));
});
exports.default = router;
