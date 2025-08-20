const router = require('express').Router();
const ctrl = require('../controllers/packinglist.controller');
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

router.get('/', verifyFirebaseToken, ctrl.list);
router.post('/', verifyFirebaseToken, ctrl.create);
router.get('/:id', verifyFirebaseToken, ctrl.get);
router.put('/:id', verifyFirebaseToken, ctrl.update);
router.delete('/:id', verifyFirebaseToken, ctrl.remove);
router.get('/:packingListId/checklists', verifyFirebaseToken, ctrl.listChecklists);
router.post('/:packingListId/checklists', verifyFirebaseToken, ctrl.createChecklist);

module.exports = router;
