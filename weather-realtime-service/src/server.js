require('dotenv').config();
const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weatherRoutes');
const swaggerSpecs = require('./config/swagger');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});

// Mount route
// Gateway sẽ chuyển /api/weather -> vào đây
app.use('/', weatherRoutes);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`☀️ Weather Realtime Service running on port ${PORT}`);
});