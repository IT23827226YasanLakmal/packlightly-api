const express = require('express');
const router = express.Router();
const authenticateFirebase = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');

// Protected route example
router.get('/profile', authenticateFirebase, authController.getProfile);

module.exports = router;
