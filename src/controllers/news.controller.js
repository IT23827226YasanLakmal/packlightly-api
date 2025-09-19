const { NewsService } = require("../services/news.service");
const newsService = new NewsService();

class NewsController {
  // Fetch news from NewsData.io and save to DB
  async fetchAndSave(req, res) {
    try {
      const news = await newsService.fetchAndSaveNews();
      res.json({ success: true, news });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get all news from DB
  async getAll(req, res) {
    try {
      const news = await newsService.getAllNews();
      res.json({ success: true, news });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Update a news article
  async update(req, res) {
    try {
      const updated = await newsService.updateNews(req.params.id, req.body);
      res.json({ success: true, news: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Delete a news article
  async delete(req, res) {
    try {
      await newsService.deleteNews(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = { NewsController };
