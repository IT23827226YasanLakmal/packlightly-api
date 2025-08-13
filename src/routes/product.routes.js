const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

router.get('/', verifyFirebaseToken, ctrl.list);
router.post('/', verifyFirebaseToken, ctrl.create);
router.get('/:id', verifyFirebaseToken, ctrl.get);
router.put('/:id', verifyFirebaseToken, ctrl.update);
router.delete('/:id', verifyFirebaseToken, ctrl.remove);

module.exports = router;
