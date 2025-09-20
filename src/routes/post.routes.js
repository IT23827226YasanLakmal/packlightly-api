const router = require("express").Router();
const postController = require("../controllers/post.controller");
const { verifyFirebaseToken } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

// CRUD
router.get("/", postController.list); // Public route - anyone can view posts
router.get("/my", verifyFirebaseToken, postController.getMyPosts); // Get user's own posts
router.get("/:id", postController.getById); // Public route - anyone can view a post
router.post("/", verifyFirebaseToken, upload.single("image"), postController.create);
router.put("/:id", verifyFirebaseToken, upload.single("image"), postController.update);
router.delete("/:id", verifyFirebaseToken, postController.delete);

// Add comment
router.post("/:id/comments", postController.addComment);

module.exports = router;
