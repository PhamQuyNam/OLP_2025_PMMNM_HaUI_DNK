require('dotenv').config();
const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Mount route
// Gateway sẽ chuyển /api/weather -> vào đây
app.use('/', weatherRoutes);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`☀️ Weather Realtime Service running on port ${PORT}`);
});