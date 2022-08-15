/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';
import { respond } from './respond';

/**
 * Logged errors print out to the server's logs so that we have a record of all errors. In future
 * this may change to saving the error info to the database, notifying the admin, or similar
 */
class LoggedError extends Error {
  constructor(message, originalError) {
    super(message);
    this.message = message;
    if (originalError) {
      winston.error('Original error:', { stack: originalError.stack });
    }
    winston.error(this.message, { stack: this.stack });
  }
}

/**
 * Responding errors are able to respond to the client's request, informing them of the error with
 * the appropriate http status code
 */
export class RespondingError extends LoggedError {
  constructor(message, statusCode, extraFields = {}, originalError) {
    super(message, originalError);
    this.statusCode = statusCode;
    this.extraFields = extraFields;
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
    super(`Internal server error: ${error.message}`, 500, undefined, error);
  }
}

export class UnauthenticatedError extends RespondingError {
  constructor(message) {
    super(message, 401);
  }
}

export class UnverifiedError extends RespondingError {
  constructor(message) {
    super(message, 403);
  }
}

export class PermissionsError extends RespondingError {
  constructor(message) {
    super(message, 403);
  }
}

export class UploadError extends RespondingError {
  /**
   * @param {{ message: string, fileName: string}[]} [errors]
   * @param {string[]} [successes]
   */
  static multiFileErrorMessage(errors, successes) {
    const errorPart = errors
      .map(({ fileName, message: errorMsg }) => `\n  ${fileName}: ${errorMsg}`)
      .join('');
    if (successes.length === 0) {
      return errorPart;
    }

    const successPart = successes.map(fileName => `\n  ${fileName}`).join('');
    return `\n\nFailures:${errorPart}\n\nSuccesses:${successPart}`;
  }

  /**
   * Error response for a web request to upload file(s)
   * Can be used in a few ways:
   *  1. Rethrow existing error
   *    try {
   *      ...
   *    } catch (error) {
   *      throw new UploadError(error);
   *    }
   *
   *  2. Throw a specified error message
   *    throw new UploadError({ message: 'Invalid JSON file' });
   *
   *  3. Throw a specified error per file
   *    throw new UploadError([
   *      { message: 'Invalid JSON file', fileName: 'file1' },
   *      { message: 'Age cannot be less that 0', fileName: 'file2' },
   *    ]);
   *
   *  4. Throw a message for some files, but also list files that did not fail (useful when importing multiple files and allowing some to import without others)
   *    throw new UploadError([
   *      { message: 'Invalid JSON file', fileName: 'badFile1' },
   *      { message: 'Age cannot be less that 0', fileName: 'badFile2' },
   *    ],
   *    [
   *      'goodFile1',
   *      'goodFile2',
   *    ]);
   *
   * @param {{ message: string } | { message: string, fileName: string}[]} [errors]
   * @param {string[]} [successes]
   */
  constructor(errors, successes = []) {
    if (!errors) {
      super(`File upload failed`, 500);
      return;
    }

    // Just a single error
    if (!Array.isArray(errors)) {
      super(`File upload failed: ${errors.message}`, 500);
      return;
    }

    super(`File upload failed: ${UploadError.multiFileErrorMessage(errors, successes)}`, 500);
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

export class Dhis2Error extends RespondingError {
  constructor(error, requestedResource) {
    super(`DHIS2 responded with the error "${error.message}" for ${requestedResource}`, 500);
  }
}

export class CustomError extends RespondingError {
  constructor(jsonFields, extraJsonFields) {
    const json = {
      responseStatus: 500,
      responseText: 'Internal server error',
      ...jsonFields,
      ...extraJsonFields,
    };
    const { responseText, responseStatus, description } = json;
    const { status, details } = responseText;
    const errorMessage = status || responseText;
    super(errorMessage, responseStatus, { description, status, details });
  }
}

export class TupaiaAppAuthorisationError extends CustomError {
  constructor() {
    super({
      responseText: {
        responseStatus: 500,
        type: 'Tupaia App Authorisation Error',
        status: 'Failed to authorise with Tupaia App Server',
      },
    });
  }
}

export class TupaiaAppCommunicationError extends CustomError {
  constructor(error) {
    super({
      responseText: {
        responseStatus: 500,
        type: 'Tupaia App Communication error',
        status: 'Failed to connect to Tupaia App Server',
        errorMessage: error.message,
      },
    });
  }
}
