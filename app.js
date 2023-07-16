const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const routes = require('./routes/route')

app.use(bodyParser.json());

app.use('/', routes);

module.exports = app;