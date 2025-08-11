const router = require('express').Router();
const ctrl = require('../controllers/post.controller');
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

router.get('/', ctrl.list); // public
router.post('/', verifyFirebaseToken, ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', verifyFirebaseToken, ctrl.update);
router.delete('/:id', verifyFirebaseToken, ctrl.remove);

module.exports = router;
