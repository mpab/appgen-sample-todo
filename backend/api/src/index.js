const express = require('express');
const cors = require('cors');
app = express();

const PORT = process.env.PORT ?? 3000;

const corsOptions = {
    origin: `*`,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Access-Control-Allow-Headers,Access-Control-Allow-Origin,Access-Control-Request-Method,Access-Control-Request-Headers,Origin,Cache-Control,Content-Type,X-Token,X-Refresh-Token",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(express.json(), cors(corsOptions));
app.disable('x-powered-by');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// callback for endpoints
module.exports = (endpoint) => {
    app.use('/api', endpoint)
}
require('./endpoints');

// set top-level route, component determines sub-route (and http verbs)
const server = app.listen(PORT, (error) => {
    if (error) {
        throw error // e.g. EADDRINUSE
    }
    console.log(`Listening on ${JSON.stringify(server.address())}`)
});
