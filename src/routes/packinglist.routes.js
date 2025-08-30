const router = require('express').Router();
const ctrl = require('../controllers/packinglist.controller');
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

router.get('/', verifyFirebaseToken, ctrl.list);
router.post('/', verifyFirebaseToken, ctrl.create);
router.get('/:id', verifyFirebaseToken, ctrl.get);
router.put('/:id', verifyFirebaseToken, ctrl.update);
router.delete('/:id', verifyFirebaseToken, ctrl.remove);

router.patch('/:id/category/:category', verifyFirebaseToken, ctrl.updateCategory);

// Generate AI packing list for a trip
router.post('/:tripId/ai-generate', ctrl.generateAIPackingList);

// Add AI suggestions to existing packing list
router.post('/:id/ai-suggestions', ctrl.addAISuggestions);

module.exports = router;
