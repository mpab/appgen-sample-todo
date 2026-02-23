const express = require('express');
const app = express();
const response = require('../response');

// CRUD API
const apiPath = "/Info"

apiInfo = {
    major: "0",
    minor: "0",
    revision: "1"
};

// Read ALL
// http://localhost:3000/api/Info
module.exports = app.get(apiPath, async (req, res) => {
    response.success(res, [apiInfo], `api info`);
});

