const express = require('express');
const cors = require('cors');

const timerRouter = require('./routes/timerRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(`${__dirname}/public`));

// ROUTES
app.use('/timer', timerRouter);

module.exports = app;