const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather Service API', // Sửa tên tùy service
      version: '1.0.0',
    },
    servers: [
      { url: '/api/weather', description: 'Weather Service' }, // Quan trọng: Base URL qua Gateway
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Đường dẫn tới file có comment
};

const specs = swaggerJsdoc(options);
module.exports = specs;