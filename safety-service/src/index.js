require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sosRoutes = require('./routes/sosRoutes');
const { createSafetyTables } = require('./models/schema');
const swaggerSpecs = require('./config/swagger');

const app = express();
app.use(cors());
app.use(express.json());


app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});


app.use('/', sosRoutes);

const PORT = process.env.PORT || 3006;

const startServer = async () => {
    try {
        // Tự động tạo bảng DB trước khi mở cổng
        await createSafetyTables();

        app.listen(PORT, () => {
            console.log(`⛑️  Safety Service (SOS & Shelters) running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start Safety Service:", err);
    }
};

startServer();