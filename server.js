const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔍 Search Endpoint
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const page = parseInt(req.query.page) || 1;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        const cx = process.env.CX_ID;

        if (!apiKey || !cx) {
            return res.status(500).json({ error: 'Google API key or CX ID not configured' });
        }

        // Google Custom Search API (official)
        const startIndex = (page - 1) * 10 + 1; // Google API uses 1-based indexing
        const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&start=${startIndex}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        // Format results
        const results = {
            organic: data.items || [],
            searchInformation: data.searchInformation || null,
            spelling: data.spelling || null,
            promotions: data.promotions || null,
            queries: data.queries || null
        };

        res.json(results);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🩺 Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Velomora Backend is running' });
});

// 🚀 Start Server
app.listen(PORT, () => {
    console.log(`🚀 Velomora Backend running on port ${PORT}`);
});
