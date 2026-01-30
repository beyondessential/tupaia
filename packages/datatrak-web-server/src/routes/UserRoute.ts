import type { Request } from 'express';

import type { Route } from '@tupaia/server-boilerplate';
import { UnexpectedNullishValueError } from '@tupaia/tsutils';
import type { DatatrakWebUserRequest } from '@tupaia/types';
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

    const fetchProject = async () => {
      try {
        const { code: projectCode } = await models.project.findOneOrThrow(
          { id: projectId },
          { columns: ['code'] },
        );
        return await ctx.services.webConfig.fetchProject(projectCode);
      } catch {
        if (
          e instanceof UnexpectedNullishValueError || // Project doesn’t exist in DB
          (e instanceof CustomError && e.statusCode === 404) // Fetch from web-config-server failed
        ) {
          return null;
        }
        throw e;
      }
    };
    const fetchCountry = async () =>
      await ctx.services.central.fetchResources(`entities/${countryId}`, {
        columns: ['id', 'name', 'code'],
      });

    const [project, country] = await Promise.all([
      projectId ? fetchProject() : null,
      countryId ? fetchCountry() : null,
    ]);

    return await models.user.transformUserData(
      { ...userData, access_policy: accessPolicy.policy },
      project,
      country,
    );
  }
}
