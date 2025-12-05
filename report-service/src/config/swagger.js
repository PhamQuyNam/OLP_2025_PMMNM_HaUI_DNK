/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Report Service API', // Sửa tên tùy service
      version: '1.0.0',
    },
    servers: [
      { url: '/', description: 'Report Service' }, // Quan trọng: Base URL qua Gateway
    ],
  },
  apis: ['./src/routes/reportRoutes.js', './src/controllers/reportController.js'], // Đường dẫn tới file có comment
};

const specs = swaggerJsdoc(options);
module.exports = specs;