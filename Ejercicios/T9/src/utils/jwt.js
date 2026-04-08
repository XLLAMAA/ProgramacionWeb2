const jwt = required('jsonwebtoken');

const generarToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    )
}

const veryfyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export { generarToken, veryfyToken }