const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Search endpoint
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

        // Extract only title, link, and snippet from results
        const results = data.organic_results ? data.organic_results.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet
        })) : [];

        res.json({ results });
        
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Velomora Backend is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Velomora Backend running on port ${PORT}`);
    console.log(`🔍 Search endpoint: http://localhost:${PORT}/search?q=your_query`);
});
