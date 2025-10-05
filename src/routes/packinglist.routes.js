const router = require('express').Router();
const ctrl = require('../controllers/packinglist.controller');
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

router.get('/', verifyFirebaseToken, ctrl.list);
router.post('/', verifyFirebaseToken, ctrl.create);
router.get('/:id', verifyFirebaseToken, ctrl.get);
router.put('/:id', verifyFirebaseToken, ctrl.update);
router.delete('/:id', verifyFirebaseToken, ctrl.remove);

router.patch('/:id/category/:category', verifyFirebaseToken, ctrl.updateCategory);

// Update individual checklist item
router.patch('/:id/category/:category/item/:itemId', verifyFirebaseToken, ctrl.updateChecklistItem);

// Update checked status of a specific item
router.patch('/:id/category/:category/item/:itemId/checked', verifyFirebaseToken, ctrl.updateCheckedStatus);

// Generate AI packing list for a trip
router.post('/:tripId/ai-generate',verifyFirebaseToken, ctrl.generateAIPackingList);

// Generate AI suggestions for a packing list (returns suggestions without creating packing list)
router.get('/:id/ai-suggestions', verifyFirebaseToken, ctrl.generateAISuggestion);

// Add AI suggestions to existing packing list
router.post('/:id/add-ai-suggestions', verifyFirebaseToken, ctrl.addAISuggestions);

module.exports = router;
