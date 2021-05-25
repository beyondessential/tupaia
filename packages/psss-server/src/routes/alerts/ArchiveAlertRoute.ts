/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
 import { RespondingError } from '@tupaia/utils';
import { Route } from '../Route';

export class ArchiveAlertRoute extends Route {
  async buildResponse() {
    const { alertId } = this.req.params;
    const alertSurveyResponse = await this.meditrakConnection?.findSurveyResponseById(alertId);

    if (!alertSurveyResponse) {
      throw new RespondingError('Alert cannot be found', 500);
    }
    
    return this.meditrakConnection?.updateSurveyResponseByObject(alertSurveyResponse, [{
      type: 'Binary',
      code: 'PSSS_Alert_Archived',
      value: 'Yes',
    }]);
  }
}
