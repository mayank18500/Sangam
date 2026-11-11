import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const server = http.createServer(app);

const PORT = env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Sangam Express API running on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/api/v1/health`);
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('🔒 HTTP server closed.');
    await prisma.$disconnect();
    console.log('💾 Database connection closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Forcefully terminating after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
