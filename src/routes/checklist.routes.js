const router = require('express').Router();
const ctrl = require('../controllers/checklist.controller');
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

// ✅ List all checklists under a packing list
router.get('/packing/:packingListId', verifyFirebaseToken, ctrl.list);

// ✅ Create a new checklist in a packing list
router.post('/packing/:packingListId', verifyFirebaseToken, ctrl.create);

// ✅ Get a single checklist by ID
router.get('/:id', verifyFirebaseToken, ctrl.get);

// ✅ Update a checklist (name, etc.)
router.put('/:id', verifyFirebaseToken, ctrl.update);

// ✅ Delete a checklist
router.delete('/:id', verifyFirebaseToken, ctrl.remove);

module.exports = router;
