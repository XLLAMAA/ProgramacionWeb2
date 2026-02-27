const express = require('express');
const movies = require('./movies.routes');

const router = express.Router();
router.use('/movies', movies);

module.exports = router;
