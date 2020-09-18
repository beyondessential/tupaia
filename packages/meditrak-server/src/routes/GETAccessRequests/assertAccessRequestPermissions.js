/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../permissions/constants';

export const hasAccessRequestPermissions = async (accessPolicy, models, accessRequest) => {
  const entity = await models.entity.findById(accessRequest.entity_id);
  return accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
};

export const assertAccessRequestPermissions = async (accessPolicy, models, accessRequest) => {
  const hasPermission = await hasAccessRequestPermissions(accessPolicy, models, accessRequest);
  if (!hasPermission) {
    throw new Error('Need Admin Panel access to the country this access request is for');
  }
  return true;
};

export const filterAccessRequestsByPermissions = async (accessPolicy, accessRequests, models) => {
  if (accessPolicy.allowsSome(null, BES_ADMIN_PERMISSION_GROUP)) {
    return accessRequests;
  }

  const entities = await models.entity.findManyById(accessRequests.map(ar => ar.entity_id));
  const entitiesById = keyBy(entities, 'id');

  const filteredAccessRequests = accessRequests.filter(accessRequest => {
    const entity = entitiesById[accessRequest.entity_id];
    return accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
  });
  return filteredAccessRequests;
};
