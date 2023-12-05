/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebProjectCountryAccessListRequest } from '@tupaia/types';

export type ProjectCountryAccessListRequest = Request<
  TupaiaWebProjectCountryAccessListRequest.Params,
  TupaiaWebProjectCountryAccessListRequest.ResBody,
  TupaiaWebProjectCountryAccessListRequest.ReqBody,
  TupaiaWebProjectCountryAccessListRequest.ReqQuery
>;

export class ProjectCountryAccessListRoute extends Route<ProjectCountryAccessListRequest> {
  public async buildResponse() {
    const { ctx, params } = this.req;
    const { projectCode } = params;
    const { projects } = await ctx.services.webConfig.fetchProjects();

    const project = projects.find(({ code }: { code: string }) => code === projectCode);
    if (!project) {
      throw new Error(`No project found with code '${projectCode}'`);
    }
    const { names } = project;
    const countryAccessList = await ctx.services.central.fetchResources('me/countries');
    return names.map((name: string) => {
      const country = countryAccessList.find(
        ({ name: countryName }: { name: string; accessRequests: string[]; hasAccess: boolean }) =>
          countryName === name,
      );
      const { hasAccess } = country;
      const hasPendingAccess = country.accessRequests.includes(projectCode) && !hasAccess;

      return {
        id: country?.id,
        name,
        hasAccess,
        hasPendingAccess,
      };
    });
  }
}
