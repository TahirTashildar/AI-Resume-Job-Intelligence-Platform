const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const logger = require('./utils/logger');

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port} [${env.nodeEnv}]`);
  });
}

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled promise rejection', { message: err.message });
});

start();
