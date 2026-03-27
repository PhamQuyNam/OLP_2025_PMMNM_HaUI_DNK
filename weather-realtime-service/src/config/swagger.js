const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather Service API', // Sửa tên tùy service
      version: '1.0.0',
    },
    servers: [
      { url: '/', description: 'Weather Service' }, // Quan trọng: Base URL qua Gateway
    ],
  },
  apis: ['./src/routes/weatherRoutes.js', './src/controllers/weatherController.js'], // Đường dẫn tới file có comment
};

const specs = swaggerJsdoc(options);
module.exports = specs;