/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveyUsersRequest, EntityType } from '@tupaia/types';
import { QUERY_CONJUNCTIONS } from '@tupaia/database';

const USERS_EXCLUDED_FROM_LIST = [
  'edmofro@gmail.com', // Edwin
  'kahlinda.mahoney@gmail.com', // Kahlinda
  'lparish1980@gmail.com', // Lewis
  'sus.lake@gmail.com', // Susie
  'michaelnunan@hotmail.com', // Michael
  'vanbeekandrew@gmail.com', // Andrew
  'gerardckelly@gmail.com', // Gerry K
  'geoffreyfisher@hotmail.com', // Geoff F
  'josh@sussol.net', // mSupply API Client
  'unicef.laos.edu@gmail.com', // Laos Schools Data Collector
  'tamanu-server@tupaia.org', // Tamanu Server
  'public@tupaia.org', // Public User
];

export type SurveyUsersRequest = Request<
  DatatrakWebSurveyUsersRequest.Params,
  DatatrakWebSurveyUsersRequest.ResBody,
  DatatrakWebSurveyUsersRequest.ReqBody,
  DatatrakWebSurveyUsersRequest.ReqQuery
>;

const DEFAULT_PAGE_SIZE = 100;

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

    const usersFilter = {
      id: userIds,
      email: { comparator: 'not in', comparisonValue: USERS_EXCLUDED_FROM_LIST },
      [QUERY_CONJUNCTIONS.RAW]: {
        // exclude E2E users and any internal users
        sql: `(email NOT LIKE '%tupaia.org' AND email NOT LIKE '%beyondessential.com.au' AND email NOT LIKE '%@bes.au')`,
      },
    } as Record<string, any>;

    if (searchTerm) {
      usersFilter.full_name = { comparator: 'ilike', comparisonValue: `${searchTerm}%` };
    }

    const users = await models.user.find(usersFilter, {
      sort: ['full_name ASC'],
      limit: DEFAULT_PAGE_SIZE,
    });
    const userData = users.map(user => ({
      id: user.id,
      name: user.full_name,
    }));

    // only return the id and name of the users
    return userData;
  }
}
