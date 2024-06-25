/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveyUsersRequest, EntityType } from '@tupaia/types';
import { QUERY_CONJUNCTIONS } from '@tupaia/database';

export type SurveyUsersRequest = Request<
  DatatrakWebSurveyUsersRequest.Params,
  DatatrakWebSurveyUsersRequest.ResBody,
  DatatrakWebSurveyUsersRequest.ReqBody,
  DatatrakWebSurveyUsersRequest.ReqQuery
>;

const DEFAULT_PAGE_SIZE = 100;

const E2E_USER = 'test_e2e@beyondessential.com.au';

export class SurveyUsersRoute extends Route<SurveyUsersRequest> {
  public async buildResponse() {
    const { models, params, query } = this.req;
    const { surveyCode, countryCode } = params;

    const { filter } = query;

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

    // get the ancestors of the permission group
    const permissionGroupWithAncestors = await permissionGroup.getAncestors();

    const entity = await models.entity.findOne({
      country_code: countryCode,
      type: EntityType.country,
    });

    // get the user entity permissions for the permission group and its ancestors
    const userEntityPermissions = await models.userEntityPermission.find({
      permission_group_id: permissionGroupWithAncestors.map(p => p.id),
      entity_id: entity.id,
    });

    const userIds = userEntityPermissions.map(uep => uep.user_id);

    const users = await models.user.find(
      {
        id: userIds,
        ...filter,
        // exclude the e2e user and any user with a tupaia.org email, as these are api-client users
        email: { comparator: '!=', comparisonValue: E2E_USER },
        [QUERY_CONJUNCTIONS.AND]: {
          email: { comparator: 'not like', comparisonValue: '%@tupaia.org' },
        },
      },
      {
        sort: ['full_name ASC'],
        limit: DEFAULT_PAGE_SIZE,
      },
    );
    const userData = users.map(user => ({
      id: user.id,
      name: user.full_name,
    }));

    // only return the id and name of the users
    return userData;
  }
}
