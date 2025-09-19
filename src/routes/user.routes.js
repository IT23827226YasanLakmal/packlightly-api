const express = require("express");
const UserController = require("../controllers/user.controller");
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');

const router = express.Router();


router.get("/:uid", verifyFirebaseToken, UserController.getUser);     // Get single user (Firebase/Firestore)
router.get("/", verifyFirebaseToken, UserController.listUsers);       // List all users (Firebase/Firestore)
router.post("/", verifyFirebaseToken, UserController.createUser);     // Create or update user profile in Firestore
router.put("/:uid", verifyFirebaseToken, UserController.updateUser);   // Update user profile in Firestore
router.patch("/:uid", verifyFirebaseToken, UserController.patchUser);  // Partial update (PATCH) user profile in Firestore

module.exports = router;