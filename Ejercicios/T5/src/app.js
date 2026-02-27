// Entry point for the movies API
const express = require('express');
const routes = require('./routes');

const app = express();
app.use(express.json());
app.use('/api', routes);

app.use((err, req, res, next) => {
    // simple error handler
    res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;
