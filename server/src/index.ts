// Load environment variables FIRST, before any modules that depend on them
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from server folder (parent of src folder)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Now dynamically import modules that depend on env vars
async function main() {
  const { default: app, swaggerInitPromise } = await import('./app.js');
  const { env, validateEnv } = await import('./config/env.js');
  const { getRedisClient, isRedisHealthy, disconnectRedis } = await import('./db/redis.js');

  // Validate required environment variables before starting server
  try {
    validateEnv();
  } catch (error) {
    console.error('❌ Environment validation failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  // Initialize Redis connection
  console.log('🔌 Connecting to Redis...');
  try {
    getRedisClient();
    const healthy = await isRedisHealthy();
    if (healthy) {
      console.log('✅ Redis connected successfully');
    } else {
      console.warn('⚠️  Redis connection not healthy, but continuing server startup');
    }
  } catch (error) {
    console.error('⚠️  Failed to connect to Redis:', error);
    console.log('Server will continue without Redis connection');
  }

  // Wait for Swagger initialization before starting server
  try {
    await swaggerInitPromise;
    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
      console.log(`📚 API Documentation: http://localhost:${env.port}/api-docs`);
      console.log(`🔒 Environment: ${env.nodeEnv}`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        console.log('HTTP server closed');

        // Disconnect Redis
        try {
          await disconnectRedis();
        } catch (error) {
          console.error('Error disconnecting Redis:', error);
        }

        console.log('✅ Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error during server startup:', error);
  process.exit(1);
});
