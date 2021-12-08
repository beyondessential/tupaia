/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { RespondingError, UnauthenticatedError } from '@tupaia/utils';
import { Route } from '../Route';

const ACTION_TO_ANSWER = {
  archive: 'Yes',
  unarchive: 'No',
};

type AlertAction = keyof typeof ACTION_TO_ANSWER;

function validateAction(action: string): asserts action is AlertAction {
  const actions = Object.keys(ACTION_TO_ANSWER);
  if (!actions.includes(action)) {
    throw new Error(`Invalid action '${action}', must be one of ${actions}`);
  }
}

export class ProcessAlertActionRoute extends Route {
  async buildResponse() {
    if (!this.meditrakConnection) throw new UnauthenticatedError('Unauthenticated');

    const { alertId, action } = this.req.params;

    validateAction(action);

    const alertSurveyResponse = await this.meditrakConnection.findSurveyResponseById(alertId);

    if (!alertSurveyResponse) {
      throw new RespondingError('Alert cannot be found', 500);
    }

    return this.meditrakConnection.updateSurveyResponseByObject(alertSurveyResponse, [
      {
        type: 'Binary',
        code: 'PSSS_Alert_Archived',
        value: ACTION_TO_ANSWER[action],
      },
    ]);
  }
}
