import winston from 'winston';

const LOG_LEVEL_CONFIG = {
  error: 'red',
  warn: 'yellow',
  success: 'green',
  info: 'cyan',
  verbose: 'dim white',
  debug: 'gray',
};

const createLogger = () => {
  winston.addColors(LOG_LEVEL_CONFIG);
  const levels = Object.fromEntries(
    Object.entries(LOG_LEVEL_CONFIG).map(([level], i) => [level, i]),
  );

  return winston.createLogger({
    levels,
    transports: [
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(({ message }) => message),
        ),
      }),
    ],
  });
};

let logger;

export const getLoggerInstance = () => {
  if (!logger) {
    logger = createLogger();
  }
  return logger;
};
