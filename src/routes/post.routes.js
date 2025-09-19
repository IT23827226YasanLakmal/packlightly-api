const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");

// Posts CRUD
router.get("/", postController.getAll);
router.get("/:id", postController.getOne);
router.post("/", postController.create);
router.put("/:id", postController.update);
router.delete("/:id", postController.delete);

// Add comment
router.post("/:id/comments", postController.addComment);

module.exports = router;
