// Basic error helper
module.exports = (message, status = 500) => ({ message, status });

export const handleHttpError = (res, message = "Error", status = 400) => {
    return res.status(status).json({
        error: true,
        message,
    });
};