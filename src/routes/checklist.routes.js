const router = require('express').Router();
const ctrl = require('../controllers/checklist.controller');
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

// ✅ Get a single checklist by ID
// GET /checklists/:id
router.get('/checklists/:id', verifyFirebaseToken, ctrl.get);

// ✅ Update a checklist (name, etc.)
// PUT /checklists/:id
router.put('/checklists/:id', verifyFirebaseToken, ctrl.update);

// ✅ Delete a checklist
// DELETE /checklists/:id
router.delete('/checklists/:id', verifyFirebaseToken, ctrl.remove);

module.exports = router;
