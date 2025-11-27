require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Mount route
app.use('/', reportRoutes);

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
    console.log(`📢 Report Service running on port ${PORT}`);
});