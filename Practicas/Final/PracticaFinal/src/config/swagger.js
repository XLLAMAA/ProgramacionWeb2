import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Proyecto web 2',
            version: '1.0.0',
            description: 'API para gestión de albaranes, clientes y projectos'
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

export default swaggerJsdoc(options);