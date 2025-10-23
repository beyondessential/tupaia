import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUserRequest, WebServerProjectRequest } from '@tupaia/types';

export type UserRequest = Request<
  DatatrakWebUserRequest.Params,
  DatatrakWebUserRequest.ResBody,
  DatatrakWebUserRequest.ReqBody,
  DatatrakWebUserRequest.ReqQuery
>;

export class UserRoute extends Route<UserRequest> {
  public async buildResponse() {
    const { ctx, session, accessPolicy, models } = this.req;

    // Avoid sending a 'me' request as the api user
    if (!session) {
      // Triggers frontend login
      return {};
    }

    const userData = await ctx.services.central.getUser();
    const { preferences = {} } = userData;
    const { project_id: projectId, country_id: countryId } = preferences;

    const fetchProject = async () => {
      const { projects } = await ctx.services.webConfig.fetchProjects();
      return projects.find((p: WebServerProjectRequest.ResBody) => p.id === projectId);
    };

    const [project, country] = await Promise.all([
      projectId ? fetchProject() : null,
      countryId
        ? ctx.services.central.fetchResources(`entities/${countryId}`, {
            columns: ['id', 'name', 'code'],
          })
        : null,
    ]);

    return models.user.transformUserData(
      { ...userData, access_policy: accessPolicy.policy },
      project,
      country,
    );
  }
}
