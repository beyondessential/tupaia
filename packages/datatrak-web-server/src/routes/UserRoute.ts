import { Request } from 'express';

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '@tupaia/constants';
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
    const { ctx, session, accessPolicy } = this.req;

    // Avoid sending a 'me' request as the api user
    if (!session) {
      // Triggers frontend login
      return {};
    }

    const {
      id,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      email,
      employer,
      position,
      mobile_number: mobileNumber,
      preferences = {},
    } = await ctx.services.central.getUser();

    const {
      project_id: projectId,
      country_id: countryId,
      delete_account_requested,
      hide_welcome_screen,
    } = preferences;

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

    return {
      fullName,
      firstName,
      lastName,
      email,
      id,
      employer,
      position,
      mobileNumber,
      projectId,
      project,
      country,
      deleteAccountRequested: delete_account_requested === true,
      hideWelcomeScreen: hide_welcome_screen === true,
      hasAdminPanelAccess:
        accessPolicy?.allowsSome(undefined, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP) ?? false,
      accessPolicy: accessPolicy.policy,
    };
  }
}
