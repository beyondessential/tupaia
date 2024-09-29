/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

/**
 * Fetches a project by its ID from webConfig server
 * @param ctx
 * @param projectId
 */
export const getProjectById = async (ctx: any, projectId: string) => {
  const { projects = [] } = await ctx.services.webConfig.fetchProjects({
    showExcludedProjects: false,
  });

  const { id, name, code, homeEntityCode, dashboardGroupName, defaultMeasure } = projects.find(
    ({ id }: { id: string }) => id === projectId,
  );

  return {
    id,
    name,
    code,
    homeEntityCode,
    dashboardGroupName,
    defaultMeasure,
  };
};
