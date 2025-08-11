const router = require('express').Router();
const ctrl = require('../controllers/news.controller');
const { verifyFirebaseToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/', ctrl.list);
router.post('/', verifyFirebaseToken, requireRole('admin'), ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', verifyFirebaseToken, requireRole('admin'), ctrl.update);
router.delete('/:id', verifyFirebaseToken, requireRole('admin'), ctrl.remove);

module.exports = router;
