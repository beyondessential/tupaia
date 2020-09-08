/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { flattenDeep, keyBy } from 'lodash';
import { hasAccessToEntityForVisualisation } from '../utilities';

import { hasBESAdminAccess } from '../../permissions';

export const filterMapOverlaysByPermissions = async (accessPolicy, models, mapOverlays) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return mapOverlays;
  }

  const allEntityCodes = [...new Set(flattenDeep(mapOverlays.map(m => m.countryCodes)))];
  const entities = await models.entity.find({ code: allEntityCodes });
  const entityByCode = keyBy(entities, 'code');
  const accessCache = {}; //Cache the access so that we dont have to recheck for some map overlays
  const filteredMapOverlays = [];

  for (let i = 0; i < mapOverlays.length; i++) {
    const mapOverlay = mapOverlays[i];
    const countryCodes = mapOverlay.countryCodes || [];
    const mapOverlayEntities = countryCodes.map(c => entityByCode[c]);
    const permissionGroup = mapOverlay.userGroup;
    const countryCodesString = countryCodes.join(',');

    //permissionGroup and countryCodes are the 2 values for checking access for a map overlay
    const cacheKey = `${permissionGroup}/${countryCodesString}`;
    let hasAccessToMapOverlay = accessCache[cacheKey];

    //Perform access checking if its not in the cache, otherwise reuse the value
    if (hasAccessToMapOverlay === undefined) {
      for (let j = 0; j < mapOverlayEntities.length; j++) {
        const mapOverlayEntity = mapOverlayEntities[j];
        hasAccessToMapOverlay = await hasAccessToEntityForVisualisation(
          accessPolicy,
          models,
          mapOverlayEntity,
          permissionGroup,
        );

        //If users have access to any countries of the overlay,
        //it should be enough to allow access the overlay
        if (hasAccessToMapOverlay) {
          break;
        }
      }

      if (hasAccessToMapOverlay === undefined) {
        hasAccessToMapOverlay = accessPolicy.allowsSome(null, permissionGroup);
      }

      accessCache[cacheKey] = hasAccessToMapOverlay;
    }

    if (hasAccessToMapOverlay) {
      filteredMapOverlays.push(mapOverlay);
    }
  }

  return filteredMapOverlays;
};

export const assertMapOverlaysPermissions = async (accessPolicy, models, mapOverlays) => {
  const filteredMapOverlays = await filterMapOverlaysByPermissions(
    accessPolicy,
    models,
    mapOverlays,
  );

  if (filteredMapOverlays.length !== mapOverlays.length) {
    throw new Error('You do not have permissions for the requested map overlay(s)');
  }

  return true;
};
