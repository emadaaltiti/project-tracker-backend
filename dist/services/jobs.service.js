"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const jobs_service_1 = require("./jobs.service");
const prisma_1 = require("../libs/prisma");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// trigger recompute metrics for the user's organization
router.post('/recompute-metrics', async (req, res) => {
    try {
        const job = await (0, jobs_service_1.enqueueRecompute)(req.user.organizationId);
        res.status(202).json((0, response_1.success)({ jobId: job.id }, 'Job enqueued'));
    }
    catch (err) {
        res.status(500).json((0, response_1.fail)('Failed to enqueue job'));
    }
});
// get job status
router.get('/:id', async (req, res) => {
    const job = await prisma_1.prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job)
        return res.status(404).json((0, response_1.fail)('Job not found'));
    res.json((0, response_1.success)(job));
});
exports.default = router;
