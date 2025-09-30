const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔍 Search endpoint
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

        // Using Google engine from SerpAPI
        const apiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        const results = {
            organic: [],
            images: [],
            videos: [],
            news: [],
            shopping: [],
            maps: []
        };

        // Organic results
        if (Array.isArray(data.organic_results)) {
            results.organic = data.organic_results.map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet || ""
            }));
        }

        // Images
        if (Array.isArray(data.images_results)) {
            results.images = data.images_results.map(img => ({
                title: img.title,
                link: img.link,
                thumbnail: img.thumbnail
            }));
        }

        // Videos
        if (Array.isArray(data.video_results)) {
            results.videos = data.video_results.map(v => ({
                title: v.title,
                link: v.link,
                thumbnail: v.thumbnail,
                source: v.source
            }));
        }

        // News
        if (Array.isArray(data.news_results)) {
            results.news = data.news_results.map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                source: item.source,
                thumbnail: item.thumbnail
            }));
        }

        // Shopping
        if (Array.isArray(data.shopping_results)) {
            results.shopping = data.shopping_results.map(p => ({
                title: p.title,
                link: p.link,
                price: p.price,
                source: p.source,
                thumbnail: p.thumbnail
            }));
        }

        // Maps / Local results (⚡ Fixed)
        if (Array.isArray(data.local_results)) {
            results.maps = data.local_results.map(loc => ({
                title: loc.title,
                link: loc.link,
                address: loc.address,
                phone: loc.phone,
                rating: loc.rating,
                thumbnail: loc.thumbnail
            }));
        } else if (data.local_results) {
            results.maps = [data.local_results]; // wrap single object in array
        }

        res.json(results);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🩺 Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Velomora Backend is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Velomora Backend running on port ${PORT}`);
});
