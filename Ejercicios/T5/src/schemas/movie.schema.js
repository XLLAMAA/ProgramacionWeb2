const Joi = require('joi');

exports.movieSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.number().required(),
});
