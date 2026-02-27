// Controller for movie routes

exports.getAll = (req, res) => {
    res.json({ message: 'List of movies' });
};

exports.create = (req, res) => {
    res.json({ message: 'Create a movie', body: req.body });
};
