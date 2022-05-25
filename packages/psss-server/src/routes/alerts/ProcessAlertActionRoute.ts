/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
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

export type ProcessAlertActionRequest = Request<
  { alertId: string; action: string },
  any,
  Record<string, unknown>,
  Record<string, never>
>;

export class ProcessAlertActionRoute extends Route<ProcessAlertActionRequest> {
  public async buildResponse() {
    if (!this.centralConnection) throw new UnauthenticatedError('Unauthenticated');

    const { alertId, action } = this.req.params;

    validateAction(action);

    const alertSurveyResponse = await this.centralConnection.findSurveyResponseById(alertId);

    if (!alertSurveyResponse) {
      throw new RespondingError('Alert cannot be found', 500);
    }

    return this.centralConnection.updateSurveyResponseByObject(alertSurveyResponse, [
      {
        type: 'Binary',
        code: 'PSSS_Alert_Archived',
        value: ACTION_TO_ANSWER[action],
      },
    ]);
  }
}
