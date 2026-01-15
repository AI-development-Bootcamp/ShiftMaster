import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';
import { env } from './config/env.js';

const app: Application = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'upgrade-insecure-requests': null, // Disable HTTPS upgrade for local dev
      },
    },
    strictTransportSecurity: false, // Disable HSTS for local dev
  })
);

// CORS configuration
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Documentation
const swaggerRouter = express.Router();
app.use('/api-docs', swaggerRouter);

if (process.env.NODE_ENV !== 'production') {
  Promise.all([import('swagger-ui-express'), import('./utils/swagger.js')])
    .then(([swaggerUi, swaggerUtils]) => {
      swaggerRouter.use(
        swaggerUi.default.serve,
        swaggerUi.default.setup(swaggerUtils.swaggerSpec)
      );
    })
    .catch((err) => {
      console.error('Failed to initialize Swagger UI:', err);
    });
}

// API Routes - All routes are automatically prefixed with /api/v1
app.use('/api/v1', apiRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
