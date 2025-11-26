// SPDX-License-Identifier: Apache-2.0
/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// Định nghĩa đường dẫn
// GET /api/history/
router.get('/', historyController.getHistory);

// GET /api/history/stats
router.get('/stats', historyController.getStats);

module.exports = router;