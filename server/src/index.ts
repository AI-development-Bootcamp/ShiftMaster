// Load environment variables FIRST, before any modules that depend on them
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from monorepo root (parent of server folder)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Now dynamically import modules that depend on env vars
async function main() {
  const { default: app, swaggerInitPromise } = await import('./app.js');
  const { env, validateEnv } = await import('./config/env.js');

  // Validate required environment variables before starting server
  try {
    validateEnv();
  } catch (error) {
    console.error('❌ Environment validation failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  // Wait for Swagger initialization before starting server
  try {
    await swaggerInitPromise;
    app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
      console.log(`📚 API Documentation: http://localhost:${env.port}/api-docs`);
      console.log(`🔒 Environment: ${env.nodeEnv}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

main();
