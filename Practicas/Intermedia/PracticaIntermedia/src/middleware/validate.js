/*
    --Valida Automaticamente con zod
    --Es reutilizable en todas las rutas
*/

export const validate = (schema) => {
    return (req, res, next) => {
        try {

            //Valido el body con el schema zod
            const validatedData = schema.parse(req.body)

            //Si es valido remplazar el req.body con datos validos
            req.body = validatedData

            next()

        } catch (e) {
            next(e)
        }
    }
}