import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUserRequest, WebServerProjectRequest } from '@tupaia/types';
import { CustomError } from '@tupaia/utils';

export interface UserRequest
  extends Request<
    DatatrakWebUserRequest.Params,
    DatatrakWebUserRequest.ResBody,
    DatatrakWebUserRequest.ReqBody,
    DatatrakWebUserRequest.ReqQuery
  > {}

export class UserRoute extends Route<UserRequest> {
  public async buildResponse() {
    const { ctx, session, accessPolicy, models } = this.req;

    // Avoid sending a 'me' request as the api user
    if (!session) {
      // Triggers frontend login
      return {};
    }

    const userData = await ctx.services.central.getUser();
    const { project_id: projectId, country_id: countryId } = userData.preferences ?? {};

    const fetchProject = async (): Promise<WebServerProjectRequest.ResBody | null> => {
      if (!projectId) return null;
      const project = await models.project.findOne({ id: projectId }, { columns: ['code'] });
      if (!project) return null;
      try {
        return await ctx.services.webConfig.fetchProject(project.code);
      } catch (e) {
        if (e instanceof CustomError && e.statusCode === 404) return null;
        throw e;
      }
    };
    const fetchCountry = async () => {
      if (!countryId) return null;
      return ctx.services.central.fetchResources(`entities/${countryId}`, {
        columns: ['id', 'name', 'code'],
      });
    };

    const [project, country] = await Promise.all([fetchProject(), fetchCountry()]);

    return await models.user.transformUserData(
      { ...userData, access_policy: accessPolicy.policy },
      project,
      country,
    );
  }
}
