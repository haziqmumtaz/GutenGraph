import 'reflect-metadata';
import { app } from './app.js';
import { config } from './config.js';

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(
    `API available at: http://localhost:${config.port}${config.apiPrefix}`
  );
  console.log(
    `Health check: http://localhost:${config.port}${config.apiPrefix}/health`
  );
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export { app };
