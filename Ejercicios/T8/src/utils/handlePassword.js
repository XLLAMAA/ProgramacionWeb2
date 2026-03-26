import bcryptjs from 'bcryptjs';

/**
 * Cifrar una contrasenia
 * @param{string} el string que le meto es la clearPass
 * @returns {Promise<string>} - Hash de la contrasenia
 */

//FUNCION PARA ENCRIPTAR LA PASS
export const encrypt = async (clearPassword) => {
    const hash = await bcryptjs.hash(clearPassword, 10);
    return hash;
}

/**
 * @param {string} clearPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Hash almacenado en BD
 * @returns {Promise<boolean>} - true si coinciden
 */

//FUNCION PARA COMPARAR LA PASS
export const compare = async (clearPassword, hashPassword) => {
    const result = await bcryptjs.compare(clearPassword, hashPassword)
    return result;
}

