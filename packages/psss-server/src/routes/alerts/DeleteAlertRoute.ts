/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { RespondingError, UnauthenticatedError } from '@tupaia/utils';
import { Route } from '../Route';

export type DeleteAlertRequest = Request<
  { alertId: string },
  any,
  Record<string, unknown>,
  Record<string, never>
>;

export class DeleteAlertRoute extends Route<DeleteAlertRequest> {
  public async buildResponse() {
    if (!this.centralConnection) throw new UnauthenticatedError('Unauthenticated');

    const { alertId } = this.req.params;

    // Just to validate if the alert exists
    const surveyResponse = await this.centralConnection.findSurveyResponseById(alertId);

    if (!surveyResponse) {
      throw new RespondingError('Alert cannot be found', 500);
    }

    return this.centralConnection.deleteSurveyResponse(surveyResponse.id);
  }
}
