/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
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
    super(`Database error ${message}${originalError ? `: ${originalError.message}` : ''}`, 500);
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

export class ValidationError extends RespondingError {
  constructor(message) {
    super(message, 400);
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
