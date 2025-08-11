const router = require('express').Router();
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/user.controller');

router.get('/me', verifyFirebaseToken, ctrl.getProfile);

module.exports = router;
