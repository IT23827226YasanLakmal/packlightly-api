const fetch = require("node-fetch");
const NEWS_API_KEY = process.env.NEWSDATA_API_KEY;

async function fetchEcoTravelNews() {
  const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=eco travel&category=environment&language=en`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NewsData API error: ${res.statusText}`);

    const data = await res.json();
    return data.results.map((item) => ({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
      source_id: item.source_id,
      image: item.image_url || "",   // map image
      content: item.content || "",   // map full article body
    }));
  } catch (err) {
    console.error("Error fetching news:", err);
    throw err;
  }
}

module.exports = { fetchEcoTravelNews };
