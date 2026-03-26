import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'PodcastHub API',
            version: '1.0.0',
            description: 'API para la gestión de podcasts'
        },
        components: {
            securitySchemes: {
                BearerToken: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpecs = swaggerJsdoc(options);

// ESTA ES LA LÍNEA QUE TE FALTA O ESTÁ MAL:
export default swaggerSpecs;