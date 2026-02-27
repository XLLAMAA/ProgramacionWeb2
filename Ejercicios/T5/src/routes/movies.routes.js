const express = require('express');
const controller = require('../controllers/movies.controller');
const { movieSchema } = require('../schemas/movie.schema');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', controller.getAll);
router.post('/', validate(movieSchema), controller.create);

module.exports = router;
