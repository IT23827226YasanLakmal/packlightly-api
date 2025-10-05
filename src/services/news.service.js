const News = require("../models/News");
const { fetchEcoTravelNews } = require("../utils/newsService");

class NewsService {
  // Fetch news from API and save to DB
  async fetchAndSaveNews() {
    const articles = await fetchEcoTravelNews();

    for (const article of articles) {
      await News.updateOne(
        { link: article.link }, // unique by link
        {
          $set: {
            title: article.title,
            link: article.link,
            description: article.description,
            pubDate: article.pubDate,
            source_id: article.source_id,
            image: article.image || "",
          },
        },
        { upsert: true }
      );
    }

    return await News.find().sort({ pubDate: -1 });
  }

  // Get all news from DB
  async getAllNews() {
    return await News.find().sort({ pubDate: -1 });
  }

  // Update a news article
  async updateNews(id, updatedData) {
    return await News.findByIdAndUpdate(id, updatedData, { new: true });
  }

  // Delete a news article
  async deleteNews(id) {
    await News.findByIdAndDelete(id);
    return { success: true };
  }

  // Create a news article
  async createNews(newsData) {
    const news = new News(newsData);
    await news.save();
    return news;
  }
}

module.exports = { NewsService };
