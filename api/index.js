const express = require('express');
const backendApp = require('../backend/server.js');

const app = express();

// Mount the backend app under /api
app.use('/api', backendApp);

module.exports = app;
