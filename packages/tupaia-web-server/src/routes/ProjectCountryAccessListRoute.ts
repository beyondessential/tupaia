/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { CentralServerProjectCountryAccessListRequest } from '@tupaia/types';

export type ProjectCountryAccessListRequest = Request<
  CentralServerProjectCountryAccessListRequest.Params,
  CentralServerProjectCountryAccessListRequest.ResBody,
  CentralServerProjectCountryAccessListRequest.ReqBody,
  CentralServerProjectCountryAccessListRequest.ReqQuery
>;

export class ProjectCountryAccessListRoute extends Route<ProjectCountryAccessListRequest> {
  public async buildResponse() {
    const { ctx, params, accessPolicy } = this.req;

    const { projectCode } = params;
    if (!projectCode) throw new Error(`No project code provided`);

    const { projects } = await ctx.services.webConfig.fetchProjects();
    const project = projects.find(({ code }: { code: string }) => code === projectCode);
    if (!project) {
      throw new Error(`No project found with code '${projectCode}'`);
    }
    const { names } = project;
    const countryAccessList = await ctx.services.central.getCountryAccessList();

    return names
      .sort()
      .reduce((result: CentralServerProjectCountryAccessListRequest.ResBody, name: string) => {
        const country = countryAccessList.find(({ name: countryName }) => countryName === name);
        if (!country) return result;

        const hasAccess = project.permissionGroups.some((permissionGroup: string) =>
          accessPolicy.allows(country.code, permissionGroup),
        );

        return [
          ...result,
          {
            id: country.id,
            name,
            hasAccess,
            hasPendingAccess: country.hasPendingAccess,
          },
        ];
      }, []);
  }
}
