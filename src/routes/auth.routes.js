const express = require('express');
const router = express.Router();
const {verifyFirebaseToken} = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');

// Protected route example
router.get('/profile', verifyFirebaseToken, authController.getProfile);

module.exports = router;
