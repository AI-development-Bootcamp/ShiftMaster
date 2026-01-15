import dotenv from 'dotenv';
import app from './app.js';
import { env } from './config/env.js';

// Load environment variables
dotenv.config();

app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
  console.log(`📚 API Documentation: http://localhost:${env.port}/api-docs`);
});
