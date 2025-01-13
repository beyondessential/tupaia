import { getLoggerInstance } from './getLoggerInstance';

export const runScriptSync = (script, cleanup) => {
  const logger = getLoggerInstance();
  let exitCode = 0;

  try {
    script();
  } catch (error) {
    exitCode = 1;
    logger.error(error.stack);
  } finally {
    if (cleanup) {
      cleanup();
    }
  }

  if (exitCode === 0) {
    logger.success('Done!');
  }
  process.exit(exitCode);
};

export const runScript = (script, cleanup) => {
  const logger = getLoggerInstance();

  script()
    .catch(error => {
      logger.error(error.stack);
      process.exit(1);
    })
    .then(() => {
      logger.success('Done!');
      process.exit(0);
    })
    .finally(() => {
      if (cleanup) {
        cleanup();
      }
    });
};
