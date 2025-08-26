import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUsersRequest } from '@tupaia/types';

export type SurveyUsersRequest = Request<
  DatatrakWebUsersRequest.Params,
  DatatrakWebUsersRequest.ResBody,
  DatatrakWebUsersRequest.ReqBody,
  DatatrakWebUsersRequest.ReqQuery
>;

export class SurveyUsersRoute extends Route<SurveyUsersRequest> {
  public async buildResponse() {
    const { models, params, query } = this.req;
    const { surveyCode, countryCode } = params;

    const { searchTerm } = query;

    const survey = await models.survey.findOne({ code: surveyCode });

    if (!survey) {
      throw new Error(`Survey with code ${surveyCode} not found`);
    }

    const { permission_group_id: permissionGroupId } = survey;

    if (!permissionGroupId) {
      return [];
    }

    // get the permission group
    const permissionGroup = await models.permissionGroup.findById(permissionGroupId);

    if (!permissionGroup) {
      throw new Error(`Permission group with id ${permissionGroupId} not found`);
    }

    return models.user.getFilteredUsersForPermissionGroup(countryCode, permissionGroup, searchTerm);
  }
}
