import { Router } from 'express';
import healthRouter from './health.js';

const apiRouter = Router();

// Mount all route modules - each router defines its own path
apiRouter.use(healthRouter);

// Future routes can be added here:
// apiRouter.use(authRouter);    // authRouter defines /auth routes
// apiRouter.use(usersRouter);   // usersRouter defines /users routes
// apiRouter.use(clientsRouter); // clientsRouter defines /clients routes
// etc.

export default apiRouter;
