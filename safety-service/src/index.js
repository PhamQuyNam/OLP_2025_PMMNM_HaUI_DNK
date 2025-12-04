/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
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