// Load environment variables FIRST, before any modules that depend on them
import 'dotenv/config';

import app from './app.js';
import { env, validateEnv } from './config/env.js';

// Validate required environment variables before starting server
try {
  validateEnv();
} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
  console.log(`📚 API Documentation: http://localhost:${env.port}/api-docs`);
  console.log(`🔒 Environment: ${env.nodeEnv}`);
});
