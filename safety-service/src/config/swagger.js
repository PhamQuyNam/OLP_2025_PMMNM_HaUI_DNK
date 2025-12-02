const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Safety Service API', // Sửa tên tùy service
      version: '1.0.0',
    },
    servers: [
      { url: '/', description: 'Safety Service' }, // Quan trọng: Base URL qua Gateway
    ],
  },
  apis: ['./src/routes/sosRoutes.js', './src/controllers/sosController.js'], // Đường dẫn tới file có comment
};

const specs = swaggerJsdoc(options);
module.exports = specs;