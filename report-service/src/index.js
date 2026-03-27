require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reportRoutes = require('./routes/reportRoutes');
const swaggerSpecs = require('./config/swagger');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});

// Mount route
app.use('/', reportRoutes);

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
    console.log(`📢 Report Service running on port ${PORT}`);
});