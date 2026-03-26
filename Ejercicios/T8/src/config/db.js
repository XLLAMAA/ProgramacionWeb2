import mongoose from "mongoose";

const dbConnect = async () => {

    try {

        //Leo la url del archivo .env 

        const DB_URI = process.env.NODE_ENV === 'test'
            ? process.env.MONGODB_TEST_URI
            : process.env.MONGODB_URI;

        //Configuracion de conexion 
        await mongoose.connect(DB_URI)

        console.log("Conexion exitosa con MongoDB!")
        console.log(`DATABASE: ${process.env.NODE_ENV === 'test' ? 'podcasthub_test' : 'podcasthub'}`);

    } catch (error) {
        //Si la contrasenia esta mal o la ip no esta autorizada entra aqui
        console.error("Error de conexion con MongoDB", error.message)

        //No hacer process.exit en tests
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1)
        } else {
            throw error;
        }
    }

};

export default dbConnect;