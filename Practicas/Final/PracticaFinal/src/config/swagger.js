import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'BildyApp API',
            version: '1.0.0',
            description: 'API REST para gestión de albaranes. Práctica final Programación Web II',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html'
            },
            contact: {
                name: 'Jaime Hernández',
                email: 'jaime@bildyapp.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Address: {
                    type: 'object',
                    properties: {
                        street: { type: 'string', example: 'Calle Principal' },
                        number: { type: 'string', example: '123' },
                        postal: { type: 'string', example: '28001' },
                        city: { type: 'string', example: 'Madrid' },
                        province: { type: 'string', example: 'Madrid' }
                    }
                },
                User: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        email: { type: 'string', format: 'email', example: 'juan@email.com' },
                        name: { type: 'string', example: 'Juan' },
                        lastName: { type: 'string', example: 'Pérez' },
                        nif: { type: 'string', example: '12345678A' },
                        role: { type: 'string', enum: ['admin', 'guest'], example: 'admin' },
                        status: { type: 'string', enum: ['pending', 'verified'], example: 'verified' },
                        company: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Company: {
                    type: 'object',
                    required: ['name', 'cif', 'owner'],
                    properties: {
                        _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        name: { type: 'string', example: 'Construcciones García SL' },
                        cif: { type: 'string', example: 'B12345678' },
                        owner: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        address: { $ref: '#/components/schemas/Address' },
                        logo: { type: 'string', example: 'https://cloudinary.com/logo.png' },
                        isFreelance: { type: 'boolean', example: false },
                        deleted: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Client: {
                    type: 'object',
                    required: ['name', 'cif', 'company'],
                    properties: {
                        _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        user: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        company: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        name: { type: 'string', example: 'Cliente SA' },
                        cif: { type: 'string', example: 'A87654321' },
                        email: { type: 'string', format: 'email', example: 'cliente@email.com' },
                        phone: { type: 'string', example: '600123456' },
                        address: { $ref: '#/components/schemas/Address' },
                        deleted: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Project: {
                    type: 'object',
                    required: ['name', 'projectCode', 'client', 'company'],
                    properties: {
                        _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        user: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        company: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        client: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        name: { type: 'string', example: 'Reforma oficinas' },
                        projectCode: { type: 'string', example: 'PROY-001' },
                        address: { $ref: '#/components/schemas/Address' },
                        email: { type: 'string', format: 'email', example: 'proyecto@email.com' },
                        notes: { type: 'string', example: 'Notas del proyecto' },
                        active: { type: 'boolean', example: true },
                        deleted: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Worker: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Juan Trabajador' },
                        hours: { type: 'number', example: 8 }
                    }
                },
                DeliveryNote: {
                    type: 'object',
                    required: ['format', 'workDate', 'project', 'client', 'company'],
                    properties: {
                        _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        user: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        company: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        client: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        project: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        format: { type: 'string', enum: ['material', 'hours'], example: 'hours' },
                        description: { type: 'string', example: 'Trabajo de fontanería' },
                        workDate: { type: 'string', format: 'date-time' },
                        hours: { type: 'number', example: 8 },
                        workers: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Worker' }
                        },
                        material: { type: 'string', example: 'Tubería PVC' },
                        quantity: { type: 'number', example: 10 },
                        unit: { type: 'string', example: 'metros' },
                        signed: { type: 'boolean', example: false },
                        signedAt: { type: 'string', format: 'date-time' },
                        signatureUrl: { type: 'string', example: 'https://cloudinary.com/firma.webp' },
                        pdfUrl: { type: 'string', example: 'https://cloudinary.com/albaran.pdf' },
                        deleted: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Cliente no encontrado' }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        currentPage: { type: 'integer', example: 1 },
                        totalItems: { type: 'integer', example: 50 },
                        totalPages: { type: 'integer', example: 5 },
                        limit: { type: 'integer', example: 10 }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options); import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'BildyApp API',
            version: '1.0.0',
            description: 'API REST para gestión de albaranes. Práctica final Programación Web II',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html'
            },
            contact: {
                name: 'Jaime Hernández',
                email: 'jaime@bildyapp.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Address: {
                    type: 'object',
                    properties: {
                        street: { type: 'string', example: 'Calle Principal' },
                        number: { type: 'string', example: '123' },
                        postal: { type: 'string', example: '28001' },
                        city: { type: 'string', example: 'Madrid' },
                        province: { type: 'string', example: 'Madrid' }
                    }
                },
                User: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        email: { type: 'string', format: 'email', example: 'juan@email.com' },
                        name: { type: 'string', example: 'Juan' },
                        lastName: { type: 'string', example: 'Pérez' },
                        nif: { type: 'string', example: '12345678A' },
                        role: { type: 'string', enum: ['admin', 'guest'], example: 'admin' },
                        status: { type: 'string', enum: ['pending', 'verified'], example: 'verified' },
                        company: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Company: {
                    type: 'object',
                    required: ['name', 'cif', 'owner'],
                    properties: {
                        _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        name: { type: 'string', example: 'Construcciones García SL' },
                        cif: { type: 'string', example: 'B12345678' },
                        owner: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        address: { $ref: '#/components/schemas/Address' },
                        logo: { type: 'string', example: 'https://cloudinary.com/logo.png' },
                        isFreelance: { type: 'boolean', example: false },
                        deleted: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Client: {
                    type: 'object',
                    required: ['name', 'cif', 'company'],
                    properties: {
                        _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        user: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        company: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        name: { type: 'string', example: 'Cliente SA' },
                        cif: { type: 'string', example: 'A87654321' },
                        email: { type: 'string', format: 'email', example: 'cliente@email.com' },
                        phone: { type: 'string', example: '600123456' },
                        address: { $ref: '#/components/schemas/Address' },
                        deleted: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Project: {
                    type: 'object',
                    required: ['name', 'projectCode', 'client', 'company'],
                    properties: {
                        _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        user: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        company: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        client: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        name: { type: 'string', example: 'Reforma oficinas' },
                        projectCode: { type: 'string', example: 'PROY-001' },
                        address: { $ref: '#/components/schemas/Address' },
                        email: { type: 'string', format: 'email', example: 'proyecto@email.com' },
                        notes: { type: 'string', example: 'Notas del proyecto' },
                        active: { type: 'boolean', example: true },
                        deleted: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Worker: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Juan Trabajador' },
                        hours: { type: 'number', example: 8 }
                    }
                },
                DeliveryNote: {
                    type: 'object',
                    required: ['format', 'workDate', 'project', 'client', 'company'],
                    properties: {
                        _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        user: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        company: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        client: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        project: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
                        format: { type: 'string', enum: ['material', 'hours'], example: 'hours' },
                        description: { type: 'string', example: 'Trabajo de fontanería' },
                        workDate: { type: 'string', format: 'date-time' },
                        hours: { type: 'number', example: 8 },
                        workers: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Worker' }
                        },
                        material: { type: 'string', example: 'Tubería PVC' },
                        quantity: { type: 'number', example: 10 },
                        unit: { type: 'string', example: 'metros' },
                        signed: { type: 'boolean', example: false },
                        signedAt: { type: 'string', format: 'date-time' },
                        signatureUrl: { type: 'string', example: 'https://cloudinary.com/firma.webp' },
                        pdfUrl: { type: 'string', example: 'https://cloudinary.com/albaran.pdf' },
                        deleted: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Cliente no encontrado' }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        currentPage: { type: 'integer', example: 1 },
                        totalItems: { type: 'integer', example: 50 },
                        totalPages: { type: 'integer', example: 5 },
                        limit: { type: 'integer', example: 10 }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);