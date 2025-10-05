const router = require("express").Router();
const postController = require("../controllers/post.controller");
const { verifyFirebaseToken } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

// Like/unlike
router.post("/:id/like", verifyFirebaseToken, postController.like);
router.post("/:id/unlike", verifyFirebaseToken, postController.unlike);
router.get("/:id/like-status", verifyFirebaseToken, postController.checkLikeStatus);

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
