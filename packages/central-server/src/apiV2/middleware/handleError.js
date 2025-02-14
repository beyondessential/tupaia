import winston from 'winston';
import { InternalServerError } from '@tupaia/utils';

export const handleError = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    console.error(err);
  }

  const { database, apiRequestLogId } = req;
  let error = err;
  if (!error.respond) {
    error = new InternalServerError(err);
  }
  if (database) {
    database.create('error_log', {
      message: error.message,
      type: error.constructor.name,
      api_request_log_id: apiRequestLogId,
    });
  }
  winston.error(err);
  error.respond(res);
};
