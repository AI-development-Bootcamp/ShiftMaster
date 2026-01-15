import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AbraShiftMaster API',
      version: '1.0.0',
      description: 'REST API for AbraShiftMaster shift management system',
      contact: {
        name: 'AbraShiftMaster Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', 'src/routes/*.ts', 'src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
