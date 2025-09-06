import 'dotenv/config';
import 'reflect-metadata';
import './shared/container/di.container'; // Initialize DI container
import app from './app';
import { AppConfig } from './shared/config/app.config';
import { connectDb, disconnectDb } from './shared/database/connection';

const port = AppConfig.port;

const server = {
  start: async () => {
    try {
      await connectDb();
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${AppConfig.environment}`);

      const serverInstance = Bun.serve({
        port: port,
        fetch: app.fetch,
      });

      console.log(`🚀 Server running at http://localhost:${port}`);
      return serverInstance;
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  },
  stop: async () => {
    console.log('Server is stopping...');
    await disconnectDb();
    console.log('Server stopped gracefully');
  },
};

export default server;
