import swaggerJsdoc from 'swagger-jsdoc';
import type { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AbraShiftMaster API',
      version: '1.0.0',
      description:
        'API documentation for AbraShiftMaster shift management system',
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
          description: 'Enter your JWT token (without "Bearer" prefix)',
        },
      },
      schemas: {
        Client: {
          type: 'object',
          properties: {
            client_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            name: { type: 'string', example: 'Acme Corp' },
            contact_info: { type: 'string', example: 'John Doe, john@acme.com' },
            active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-01T10:00:00Z' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            project_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' },
            client_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            manager_user_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174002' },
            name: { type: 'string', example: 'Website Redesign' },
            description: { type: 'string', example: 'Complete overhaul of corporate website' },
            start_date: { type: 'string', format: 'date', example: '2024-01-01' },
            end_date: { type: 'string', format: 'date', example: '2024-06-30' },
            time_format_type: { type: 'string', enum: ['sum', 'start_end'], example: 'start_end' },
            active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-01T10:00:00Z' },
          },
        },
        NewProject: {
          type: 'object',
          required: ['client_id', 'manager_user_id', 'name', 'time_format_type', 'start_date'],
          properties: {
            client_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            manager_user_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174002' },
            name: { type: 'string', example: 'Website Redesign' },
            description: { type: 'string', example: 'Complete overhaul of corporate website' },
            start_date: { type: 'string', format: 'date', example: '2024-01-01' },
            end_date: { type: 'string', format: 'date', example: '2024-06-30' },
            time_format_type: { type: 'string', enum: ['sum', 'start_end'], example: 'start_end' },
            active: { type: 'boolean', example: true, default: true },
          },
        },
        UpdateProject: {
          type: 'object',
          properties: {
            client_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            manager_user_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174002' },
            name: { type: 'string', example: 'Website Redesign' },
            description: { type: 'string', example: 'Complete overhaul of corporate website' },
            start_date: { type: 'string', format: 'date', example: '2024-01-01' },
            end_date: { type: 'string', format: 'date', example: '2024-06-30' },
            time_format_type: { type: 'string', enum: ['sum', 'start_end'], example: 'start_end' },
            active: { type: 'boolean', example: true },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
