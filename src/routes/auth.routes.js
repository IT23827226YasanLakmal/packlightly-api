const router = require('express').Router();
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/auth.controller');

router.get('/profile', verifyFirebaseToken, ctrl.profile);

module.exports = router;
