/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { RespondingError } from '@tupaia/utils';
import { Route } from '../Route';

export class DeleteAlertRoute extends Route {
  async buildResponse() {
    const { alertId } = this.req.params;

    // Just to validate if the alert exists
    const surveyResponse = await this.meditrakConnection?.findSurveyResponseById(alertId);

    if (!surveyResponse) {
      throw new RespondingError('Alert cannot be found', 500);
    }

    return this.meditrakConnection?.deleteSurveyResponse(surveyResponse.id);
  }
}
