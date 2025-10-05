const express = require("express");
const { NewsController } = require("../controllers/news.controller");

const router = express.Router();
const newsController = new NewsController();

// Create news
router.post("/", newsController.create.bind(newsController));

// Fetch from NewsData.io and save to DB
router.get("/fetch", newsController.fetchAndSave.bind(newsController));

// Get all news from DB
router.get("/", newsController.getAll.bind(newsController));

// Update news by ID
router.put("/:id", newsController.update.bind(newsController));

// Delete news by ID
router.delete("/:id", newsController.delete.bind(newsController));

module.exports = router;
