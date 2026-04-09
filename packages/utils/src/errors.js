import { respond } from './respond';

export class NotImplementedError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'NotImplementedError';
  }
}

/**
 * Responding errors are able to respond to the client's request, informing them of the error with
 * the appropriate http status code
 */
export class RespondingError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {Record<string, unknown>} extraFields
   * @param {*} originalError
   */
  constructor(message, statusCode, extraFields = {}, originalError = null) {
    super(message, { cause: originalError });
    this.name = 'RespondingError';
    this.statusCode = statusCode;
    this.extraFields = extraFields;
    this.respond = res =>
      respond(res, { error: this.message, ...this.extraFields }, this.statusCode);
  }
}

export class HttpError extends Error {
  constructor(response) {
    super(`Attempt to post data returned ${response.status}: ${response.statusText}`);
    this.name = 'HttpError';
    this.status = response.status;
  }
}

export class DatabaseError extends RespondingError {
  constructor(message, originalError) {
    super(
      `Database error: ${message}${originalError ? ` - ${originalError.message}` : ''}`,
      500,
      originalError?.extraFields,
    );
    this.name = 'DatabaseError';
  }
}

export class InternalServerError extends RespondingError {
  constructor(error) {
    super(`Internal server error: ${error.message}`, 500, undefined, error);
    this.name = 'InternalServerError';
  }
}

export class UnauthenticatedError extends RespondingError {
  constructor(message) {
    super(message, 401);
    this.name = 'UnauthenticatedError';
  }
}

export class UnverifiedError extends RespondingError {
  constructor(message) {
    super(message, 403);
    this.name = 'UnverifiedError';
  }
}

export class PermissionsError extends RespondingError {
  constructor(message) {
    super(message, 403);
    this.name = 'PermissionsError';
  }
}

export class NotFoundError extends RespondingError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
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
      super('File upload failed', 500);
    } else if (!Array.isArray(errors) /* Just a single error */) {
      super(`File upload failed: ${errors.message}`, 500);
    } else {
      super(`File upload failed: ${UploadError.multiFileErrorMessage(errors, successes)}`, 500);
    }
    this.name = 'UploadError';
  }
}

export class ValidationError extends RespondingError {
  constructor(message, details = null) {
    const extraFields = details ? { details } : null;
    super(message, 400, extraFields);
    this.name = 'ValidationError';
  }
}

export class MultiValidationError extends RespondingError {
  constructor(message, errors) {
    super(message, 400, {
      errors,
    });
    this.name = 'MultiValidationError';
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
    this.name = 'TypeValidationError';
  }
}

export class ImportValidationError extends ValidationError {
  constructor(message, rowNumber = undefined, field = undefined, tabName = undefined, details) {
    const tabError = tabName !== undefined ? `Tab ${tabName}` : '';
    const rowError = rowNumber !== undefined ? `Row ${rowNumber}` : '';
    const fieldError = field !== undefined ? `field '${field}'` : '';

    const errors = [tabError, rowError, fieldError].filter(Boolean).join(', ');

    const errorMessage = `${errors}. ${message}`;
    super(errorMessage, details);
    this.name = 'ImportValidationError';
  }
}

export class FormValidationError extends ValidationError {
  constructor(message, invalidFields) {
    super(message, 400, invalidFields);
    this.name = 'FormValidationError';
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
    this.name = 'Dhis2Error';
  }
}

export class ConflictError extends RespondingError {
  constructor(message) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class UnsupportedMediaTypeError extends RespondingError {
  constructor(message) {
    super(message, 415);
    this.name = 'UnsupportedMediaTypeError';
  }
}

export class UnprocessableContentError extends RespondingError {
  constructor(message) {
    super(message, 422);
    this.name = 'UnprocessableContentError';
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
    const { responseText, responseStatus, description, ...restOfJson } = json;
    const { status, details } = responseText;
    const errorMessage = status || responseText;
    super(errorMessage, responseStatus, { description, status, details, ...restOfJson });
    this.name = 'CustomError';
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
    this.name = 'TupaiaAppAuthorisationError';
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
    this.name = 'TupaiaAppCommunicationError';
  }
}
