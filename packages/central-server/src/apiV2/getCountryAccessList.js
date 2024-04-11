/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';

const mapRequestsToEntities = (requestedEntities, projectCodeById) => {
  const entityRequests = {};
  requestedEntities.forEach(request => {
    if (!(request.entity_id in entityRequests)) {
      entityRequests[request.entity_id] = [];
    }
    const projectCode = request.project_id != null ? projectCodeById[request.project_id] : 'none';
    entityRequests[request.entity_id].push(projectCode);
  });
  return entityRequests;
};

export async function getCountryAccessList(req, res, next) {
  const { userId, models, query, accessPolicy } = req;
  const { projectCode } = query;
  if (!projectCode) throw new Error('No project code provided');

  try {
    const project = await models.project.findOne({ code: projectCode });
    if (!project) throw new Error(`No project found with code ‘${projectCode}’`);

    const countries = await project.countries();
    const countriesPendingAccess = (
      await models.accessRequest.find({
        user_id: userId,
        project_id: project.id,
        approved: null,
      })
    ).map(accessRequest => accessRequest.entity_id);

    const countryAccessList = countries
      .reduce((listSoFar, country) => {
        const { id, code, name } = country;
        const hasAccess = project.permission_groups.some(permissionGroup =>
          accessPolicy.allows(code, permissionGroup),
        );
        const hasPendingAccess = countriesPendingAccess.includes(id);

        const countryAccessListItem = { id, name, hasAccess, hasPendingAccess };
        return [...listSoFar, countryAccessListItem];
      }, [])
      .sort((a, b) => a.name.localeCompare(b.name));

    respond(res, countryAccessList);
  } catch (error) {
    next(error);
  }
}
