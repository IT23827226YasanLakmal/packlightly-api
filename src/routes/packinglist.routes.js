const router = require('express').Router();
const ctrl = require('../controllers/packinglist.controller');
const checklistCtrl = require('../controllers/checklist.controller');
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

router.get('/', verifyFirebaseToken, ctrl.list);
router.post('/', verifyFirebaseToken, ctrl.create);
router.get('/:id', verifyFirebaseToken, ctrl.get);
router.put('/:id', verifyFirebaseToken, ctrl.update);
router.delete('/:id', verifyFirebaseToken, ctrl.remove);
router.get('/:packingListId/checklists', verifyFirebaseToken, checklistCtrl.list);
router.post('/:packingListId/checklists', verifyFirebaseToken, checklistCtrl.create);
module.exports = router;
