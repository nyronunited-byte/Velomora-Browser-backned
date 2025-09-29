const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const apiUrl = `https://serpapi.com/search.json?engine=duckduckgo&q=${encodeURIComponent(query)}&api_key=${apiKey}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        const results = {
            organic: [],
            images: [],
            news: [],
            videos: []
        };

        // Organic (websites)
        if (data.organic_results) {
            results.organic = data.organic_results.map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet || ""
            }));
        }

        // Inline Images
        if (data.inline_images) {
            results.images = data.inline_images.map(img => ({
                title: img.title,
                link: img.link,
                thumbnail: img.thumbnail || img.image
            }));
        }

        // News
        if (data.news_results) {
            results.news = data.news_results.map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                source: item.source,
                thumbnail: item.thumbnail
            }));
        }

        // Videos (some searches may include videos_results)
        if (data.video_results) {
            results.videos = data.video_results.map(v => ({
                title: v.title,
                link: v.link,
                thumbnail: v.thumbnail,
                source: v.source
            }));
        }

        res.json(results);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Velomora Backend is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Velomora Backend running on port ${PORT}`);
    console.log(`🔍 Search endpoint: http://localhost:${PORT}/search?q=your_query`);
});
