/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import flattenDeep from 'lodash.flattendeep';
import keyBy from 'lodash.keyby';

import { hasBESAdminAccess } from '../../permissions';

export const filterMapOverlaysByPermissions = async (accessPolicy, models, mapOverlays) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return mapOverlays;
  }

  const allEntityCodes = [...new Set(flattenDeep(mapOverlays.map(m => m.countryCodes)))];
  const entities = await models.entity.find({ code: allEntityCodes });
  const entityByCode = keyBy(entities, 'code');
  const accessCache = {}; //Cache the access so that we dont have to recheck for some dashboard groups
  const filteredMapOverlays = [];

  for (let i = 0; i < mapOverlays.length; i++) {
    const mapOverlay = mapOverlays[i];
    const countryCodes = mapOverlay.countryCodes || [];
    const mapOverlayEntities = countryCodes.map(c => entityByCode[c]);
    const permissionGroup = mapOverlay.userGroup;
    const countryCodesString = countryCodes.join(',');

    //permissionGroup and countryCodes are the 2 values for checking access for a dashboard group
    let hasAccessToMapOverlay = accessCache[`${permissionGroup}|${countryCodesString}`];

    //Perform access checking if its not in the cache, otherwise reuse the value
    if (hasAccessToMapOverlay === undefined) {
      let mapOverlayEntityCodes = [];

      //Collect all the entities to check access
      for (let j = 0; j < mapOverlayEntities.length; j++) {
        const mapOverlayEntity = mapOverlayEntities[j];
        //If the entity is a project, check the access of the project's child entities
        if (mapOverlayEntity.isProject()) {
          const project = await models.project.findOne({ code: mapOverlayEntity.code });
          const projectChildren = await mapOverlayEntity.getChildren(project.entity_hierarchy_id);
          const projectChildrenCodes = projectChildren.map(pc => pc.code);
          mapOverlayEntityCodes = mapOverlayEntityCodes.concat(projectChildrenCodes);
        } else {
          mapOverlayEntityCodes.push(mapOverlayEntity.code);
        }
      }

      mapOverlayEntityCodes = mapOverlayEntityCodes.length ? mapOverlayEntityCodes : null;
      hasAccessToMapOverlay = accessPolicy.allowsSome(mapOverlayEntityCodes, permissionGroup);
      accessCache[`${permissionGroup}|${countryCodesString}`] = hasAccessToMapOverlay;
    }

    if (hasAccessToMapOverlay) {
      filteredMapOverlays.push(mapOverlay);
    }
  }

  return filteredMapOverlays;
};

export const assertMapOverlaysPermissions = async (accessPolicy, models, mapOverlay) => {
  const filteredMapOverlays = await filterMapOverlaysByPermissions(accessPolicy, models, [
    mapOverlay,
  ]);

  if (!filteredMapOverlays.length) {
    throw new Error('You do not have permissions for this map overlay');
  }

  return true;
};
