export const handleHttpError = (res, message = "Error", status = 400) => {
    return res.status(status).json({
        error: true,
        message,
    });
};