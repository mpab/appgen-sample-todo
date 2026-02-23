const swaggerAutogen = require('swagger-autogen')();

const outputFile = '../docs/swagger.json';
const endpointsFiles = ['./endpoints/*.js'];

const config = {
    info: {
        title: 'API Documentation',
        description: '',
    },
    tags: [ ],
    host: 'localhost:3000/api',
    schemes: ['http', 'https'],
};

swaggerAutogen(outputFile, endpointsFiles, config);