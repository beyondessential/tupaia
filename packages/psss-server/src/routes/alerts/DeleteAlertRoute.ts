import { Request } from 'express';
import { RespondingError } from '@tupaia/utils';
import { Route } from '../Route';

export type DeleteAlertRequest = Request<
  { alertId: string },
  any,
  Record<string, unknown>,
  Record<string, never>
>;

export class DeleteAlertRoute extends Route<DeleteAlertRequest> {
  public async buildResponse() {
    const { alertId } = this.req.params;

    // Just to validate if the alert exists
    const surveyResponse = await this.centralConnection.findSurveyResponseById(alertId);

    if (!surveyResponse) {
      throw new RespondingError('Alert cannot be found', 500);
    }

    return this.centralConnection.deleteSurveyResponse(surveyResponse.id);
  }
}
