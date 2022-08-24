/**
 * Tupaia MediTrak
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { respond, reduceToDictionary } from '@tupaia/utils';

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
  const { userId, models } = req;
  try {
    const countries = await models.entity.find({ type: 'country' });
    const entityPermissions = await models.userEntityPermission.find({ user_id: userId });
    const permittedEntityIds = new Set(entityPermissions.map(p => p.entity_id));
    const accessRequests = await models.accessRequest.find({
      user_id: userId,
      processed_date: null,
    });
    const projects = await models.project.find();
    const projectCodeById = reduceToDictionary(projects, 'id', 'code');
    const entityRequests = mapRequestsToEntities(accessRequests, projectCodeById);

    const countryAccessList = countries
      .filter(country => country.name !== 'No Country')
      .map(country => ({
        id: country.id,
        name: country.name,
        hasAccess: permittedEntityIds.has(country.id),
        accessRequests: entityRequests[country.id] || [],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    respond(res, countryAccessList);
  } catch (error) {
    next(error);
  }
}
