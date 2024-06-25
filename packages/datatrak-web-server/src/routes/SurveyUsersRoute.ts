/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveyUsersRequest } from '@tupaia/types';

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
    const { surveyCode } = params;

    const { filter } = query;

    const survey = await models.survey.findOne({ code: surveyCode });

    if (!survey) {
      throw new Error(`Survey with code ${surveyCode} not found`);
    }

    const { permission_group_id: permissionGroupId, country_ids: countryIds } = survey;

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

    // get the user entity permissions for the permission group and its ancestors
    let userEntityPermissions = await models.userEntityPermission.find({
      permission_group_id: permissionGroupWithAncestors.map(p => p.id),
    });

    // filter the user entity permissions by country
    if (countryIds) {
      const countries = await models.country.find({ id: countryIds });
      // the countryIds are not the same as entityIds so we need to get the country codes and filter by them instead
      const countryCodes = countries.map(c => c.code);
      userEntityPermissions = userEntityPermissions.filter(uep => {
        // @ts-ignore
        if (!uep.entity_code) return false;
        // @ts-ignore
        return countryCodes.includes(uep.entity_code);
      });
    }

    const userIds = userEntityPermissions.map(uep => uep.user_id);

    const users = await models.user.find(
      { id: userIds, ...filter },
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
