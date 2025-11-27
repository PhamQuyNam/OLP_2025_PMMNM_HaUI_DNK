const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alert Service API', // Sửa tên tùy service
      version: '1.0.0',
    },
    servers: [
      { url: '/', description: 'Alert Service' }, // Quan trọng: Base URL qua Gateway
    ],
  },
  apis: ['./src/routes/alertRoutes.js', './src/controllers/alertController.js'], // Đường dẫn tới file có comment
};

const specs = swaggerJsdoc(options);
module.exports = specs;