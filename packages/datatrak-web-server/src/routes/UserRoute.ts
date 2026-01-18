import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { UnexpectedNullishValueError, ensure } from '@tupaia/tsutils';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { CustomError } from '@tupaia/utils';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../constants';

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

    // check if user has admin panel access
    const hasAdminPanelAccess =
      accessPolicy?.allowsSome(undefined, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP) ?? false;

    const {
      project_id: projectId,
      country_id: countryId,
      delete_account_requested,
      hide_welcome_screen,
    } = preferences;

    let project;
    if (projectId) {
      try {
        const { code: projectCode } = ensure(
          await models.project.findOne({ id: projectId }, { columns: ['code'] }),
        );
        project = await ctx.services.webConfig.fetchProject(projectCode);
      } catch (e: any) {
        if (
          e instanceof UnexpectedNullishValueError || // Project doesn’t exist in DB
          (e instanceof CustomError && e.statusCode === 404) // Fetch from web-config-server failed
        ) {
          project = null;
        } else {
          throw e;
        }
      }
    }

    let country = null;
    if (countryId) {
      const countryResponse = await ctx.services.central.fetchResources(`entities/${countryId}`, {
        columns: ['id', 'name', 'code'],
      });
      country = countryResponse || null;
    }

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
      hasAdminPanelAccess,
    };
  }
}
