/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { Project, DatatrakWebUsersRequest } from '@tupaia/types';
import { DatatrakWebServerModelRegistry } from '../types';

export type ProjectUsersRequest = Request<
  DatatrakWebUsersRequest.Params,
  DatatrakWebUsersRequest.ResBody,
  DatatrakWebUsersRequest.ReqBody,
  DatatrakWebUsersRequest.ReqQuery
>;

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

const DEFAULT_PAGE_SIZE = 100;

const getFilteredUsers = async (
  models: DatatrakWebServerModelRegistry,
  projectCode: Project['code'],
  searchTerm: string = '',
) => {
  const usersQuery = `
    WITH 
      country_list AS (
        SELECT ARRAY_AGG(country_entity.code::TEXT) AS codes
        FROM entity country_entity
        JOIN entity_relation ON entity_relation.child_id = country_entity.id
        WHERE entity_relation.parent_id IN (
          SELECT e.id 
          FROM entity e 
          JOIN project p ON p.entity_id = e.id 
          WHERE p.code = ?
        )
      ),
      user_data AS (
        SELECT 
          u.id,
          u.email,
          CASE 
            WHEN u.last_name IS NULL THEN u.first_name
            ELSE u.first_name || ' ' || u.last_name
          END AS full_name
        FROM 
          user_account u
        JOIN 
          user_entity_permission uep ON uep.user_id = u.id
        JOIN 
          entity country ON uep.entity_id = country.id
        WHERE 
          u.email NOT LIKE '%tupaia.org'
          AND u.email NOT LIKE '%beyondessential.com.au'
          AND u.email NOT LIKE '%@bes.au'
          AND u.email NOT IN (?)
        GROUP BY 
          u.id, u.email, u.first_name, u.last_name
        HAVING 
          ARRAY_AGG(country.code::TEXT) && (SELECT codes FROM country_list)
    )
      SELECT *
      FROM user_data
      WHERE full_name LIKE ?;
      `;

  const bindings = [projectCode, USERS_EXCLUDED_FROM_LIST, `%${searchTerm}%`];

  type UserResponse = {
    id: string;
    email: string;
    full_name: string;
  }[];

  const users = (await models.database.executeSql(usersQuery, bindings)) as UserResponse;

  return users
    .sort((a, b) => a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase()))
    .map(user => ({
      id: user.id,
      name: user.full_name,
    }))
    .slice(0, DEFAULT_PAGE_SIZE);
};

export class ProjectUsersRoute extends Route<ProjectUsersRequest> {
  public async buildResponse() {
    const { models, params, query } = this.req;
    const { projectCode } = params;
    const { searchTerm } = query;

    return getFilteredUsers(models, projectCode, searchTerm);
  }
}
