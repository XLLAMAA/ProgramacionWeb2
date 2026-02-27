// Simple in-memory model for movies
let movies = [];

exports.getAll = () => movies;
exports.create = (movie) => { movies.push(movie); return movie; };
