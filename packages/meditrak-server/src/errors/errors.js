/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/
import winston from 'winston';
import { respond } from '@tupaia/utils';

/**
 * Logged errors print out to the server's logs so that we have a record of all errors. In future
 * this may change to saving the error info to the database, notifying the admin, or similar
 */
class LoggedError {
  constructor(message) {
    this.message = message;
    winston.error(this.message);
  }
}

/**
 * Responding errors are able to respond to the client's request, informing them of the error with
 * the appropriate http status code
 */
class RespondingError extends LoggedError {
  constructor(message, statusCode, extraFields = {}) {
    super(message);
    this.respond = res => respond(res, { error: this.message, ...extraFields }, statusCode);
  }
}

export class HttpError extends LoggedError {
  constructor(response) {
    super(`Attempt to post data returned ${response.status}: ${response.statusText}`);
    this.status = response.status;
  }
}

export class DatabaseError extends RespondingError {
  constructor(message, originalError) {
    super(`Database error: ${message}${originalError ? ` - ${originalError.message}` : ''}`, 500);
  }
}

export class InternalServerError extends RespondingError {
  constructor(error) {
    super(`Internal server error: ${error.message}`, 500);
  }
}

export class UnauthenticatedError extends RespondingError {
  constructor(message) {
    super(message, 401);
  }
}

export class UploadError extends RespondingError {
  constructor(originalError) {
    super(`File upload failed${originalError ? `: ${originalError.message}` : ''}`, 500);
  }
}

export class ValidationError extends RespondingError {
  constructor(message) {
    super(message, 400);
  }
}

export class MultiValidationError extends RespondingError {
  constructor(message, errors) {
    super(message, 400, {
      errors,
    });
  }
}

export class TypeValidationError extends ValidationError {
  constructor(fieldErrors, type) {
    const header = `Invalid fields on '${type}':`;
    const fieldMessages = fieldErrors.map(
      ({ field, errors }) => `\t${field}: ${errors.join(', ')}`,
    );
    const errorMessage = [header, ...fieldMessages].join('\n');

    super(errorMessage);
  }
}

export class ImportValidationError extends ValidationError {
  constructor(message, rowNumber = undefined, field = undefined, tabName = undefined) {
    const errorMessage =
      'Import failed' +
      `${tabName !== undefined ? ` in tab ${tabName}` : ''}` +
      `${rowNumber !== undefined ? ` at row ${rowNumber}` : ''}` +
      `${field !== undefined ? ` on the field '${field}'` : ''}` +
      ` with the message '${message}'`;
    super(errorMessage);
  }
}

export class FormValidationError extends ValidationError {
  constructor(message, invalidFields) {
    super(message, 400, invalidFields);
  }
}

export class UnsupportedApiVersionError extends RespondingError {
  constructor() {
    super('This version of Tupaia is no longer supported. Please update to the latest.', 410);
  }
}
