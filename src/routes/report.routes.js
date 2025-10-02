const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

// GET /api/reports/types - Get available report types (PUBLIC)
router.get('/types', ReportController.getTypes);

// All other report routes require authentication
router.use(verifyFirebaseToken);

// GET /api/reports/overview - Get quick overview stats
router.get('/overview', ReportController.getOverview);

// GET /api/reports - List all reports for the authenticated user
router.get('/', ReportController.list);

// POST /api/reports/generate - Generate a new report (async)
router.post('/generate', ReportController.generate);

// POST /api/reports/generate-sync - Generate a new report (sync)
router.post('/generate-sync', ReportController.generateSync);

// GET /api/reports/:id - Get a specific report
router.get('/:id', ReportController.get);

// POST /api/reports/:id/regenerate - Regenerate an existing report
router.post('/:id/regenerate', ReportController.regenerate);

// GET /api/reports/export/:id/:format - Export report in different formats
router.get('/export/:id/:format', ReportController.export);

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', ReportController.remove);

module.exports = router;