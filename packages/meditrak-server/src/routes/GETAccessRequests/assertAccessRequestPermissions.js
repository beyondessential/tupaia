/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../permissions/constants';

export const assertAccessRequestPermissions = async (accessPolicy, models, accessRequest) => {
  const results = await filterAccessRequestsByPermissions(accessPolicy, [accessRequest], models);
  if (results === 0) {
    throw new Error('Need Admin Panel access to the country this access request is for');
  }
  return true;
};

export const filterAccessRequestsByPermissions = async (accessPolicy, accessRequests, models) => {
  if (accessPolicy.allowsSome(null, BES_ADMIN_PERMISSION_GROUP)) {
    return accessRequests;
  }

  const countryCodesByEntityId = await models.entity.getEntityCountryCodeById(
    accessRequests.map(ar => ar.entity_id),
  );

  return accessRequests.filter(accessRequest => {
    return accessPolicy.allows(
      countryCodesByEntityId[accessRequest.entity_id],
      TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
    );
  });
};
