/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import {
  CountryAccessResponse,
  Project,
  WebServerProjectCountryAccessListRequest,
} from '@tupaia/types';

export type ProjectCountryAccessListRequest = Request<
  WebServerProjectCountryAccessListRequest.Params,
  WebServerProjectCountryAccessListRequest.ReqBody,
  WebServerProjectCountryAccessListRequest.ReqQuery,
  WebServerProjectCountryAccessListRequest.ResBody
>;

export class ProjectCountryAccessListRoute extends Route<ProjectCountryAccessListRequest> {
  public async buildResponse() {
    const { ctx, params, accessPolicy } = this.req;
    const { projectCode } = params;
    if (!projectCode) throw new Error(`No project code provided`);

    const { projects } = await ctx.services.webConfig.fetchProjects();
    const project = projects.find(({ code }: { code: Project['code'] }) => code === projectCode);
    if (!project) throw new Error(`No project found with code ‘${projectCode}’`);
    const countryAccessList = await ctx.services.central.getCountryAccessList();

    return project.names
      .sort()
      .reduce((result: WebServerProjectCountryAccessListRequest.ResBody, name: string) => {
        const country = countryAccessList.find(
          ({ name: countryName }: CountryAccessResponse) => countryName === name,
        );
        if (!country) return result;

        const hasAccess = project.permissionGroups.some((permissionGroup: string) =>
          accessPolicy.allows(country.code, permissionGroup),
        );
        const hasPendingAccess = country.accessRequests.includes(projectCode);

        return [
          ...result,
          {
            id: country?.id,
            name,
            hasAccess,
            hasPendingAccess,
          },
        ];
      }, []);
  }
}
