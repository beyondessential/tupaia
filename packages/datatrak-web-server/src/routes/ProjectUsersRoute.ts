import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUsersRequest, Project, UserAccount } from '@tupaia/types';
import { DatatrakWebServerModelRegistry } from '../types';

export interface ProjectUsersRequest
  extends Request<
    DatatrakWebUsersRequest.Params,
    DatatrakWebUsersRequest.ResBody,
    DatatrakWebUsersRequest.ReqBody,
    DatatrakWebUsersRequest.ReqQuery
  > {}

const getFilterUsersForProject = async (
  models: DatatrakWebServerModelRegistry,
  projectCode: Project['code'],
  searchTerm?: string,
) => {
  const usersQuery = `
    WITH
    country_list AS (
      SELECT DISTINCT country_entity.code::TEXT
      FROM entity country_entity
      JOIN entity_relation ON entity_relation.child_id = country_entity.id
      WHERE entity_relation.parent_id IN (
        SELECT e.id
        FROM entity e
        JOIN project p ON p.entity_id = e.id
        WHERE p.code = ?
      )
    )
    SELECT u.id
    FROM user_account u
    JOIN user_entity_permission uep ON uep.user_id = u.id
    JOIN entity country ON uep.entity_id = country.id
    WHERE country.code IN (SELECT code FROM country_list)
    GROUP BY u.id;
  `;

  const bindings = [projectCode];

  const users: { id: UserAccount['id'] }[] = await models.database.executeSql(usersQuery, bindings);
  const userIds = users.map(user => user.id);

  return models.user.getFilteredUsers(searchTerm, userIds);
};

export class ProjectUsersRoute extends Route<ProjectUsersRequest> {
  public async buildResponse() {
    const { models, params, query } = this.req;
    const { projectCode } = params;
    const { searchTerm } = query;

    return getFilterUsersForProject(models, projectCode, searchTerm);
  }
}
