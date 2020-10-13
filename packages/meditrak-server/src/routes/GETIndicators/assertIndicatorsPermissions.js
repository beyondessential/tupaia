/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { flattenDeep, keyBy } from 'lodash';
import { hasAccessToEntityForVisualisation } from '../utilities';

import { hasBESAdminAccess } from '../../permissions';

export const filterIndicatorsByPermissions = async (accessPolicy, models, indicators) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return indicators;
  }

  const allEntityCodes = [...new Set(flattenDeep(indicators.map(m => m.countryCodes)))];
  const entities = await models.entity.find({ code: allEntityCodes });
  const entityByCode = keyBy(entities, 'code');
  const accessCache = {}; // Cache the access so that we dont have to recheck for some indicators
  const filteredIndicators = [];

  for (let i = 0; i < indicators.length; i++) {
    const indicator = indicators[i];
    const countryCodes = indicator.countryCodes || [];
    const indicatorEntities = countryCodes.map(c => entityByCode[c]);
    const permissionGroup = indicator.userGroup;
    const countryCodesString = countryCodes.join(',');

    // permissionGroup and countryCodes are the 2 values for checking access for an indicator
    const cacheKey = `${permissionGroup}/${countryCodesString}`;
    let hasAccessToIndicator = accessCache[cacheKey];

    // Perform access checking if its not in the cache, otherwise reuse the value
    if (hasAccessToIndicator === undefined) {
      for (let j = 0; j < indicatorEntities.length; j++) {
        const indicatorEntity = indicatorEntities[j];
        hasAccessToIndicator = await hasAccessToEntityForVisualisation(
          accessPolicy,
          models,
          indicatorEntity,
          permissionGroup,
        );

        // If users have access to any countries of the indicator,
        // it should be enough to allow access the indicator
        if (hasAccessToIndicator) {
          break;
        }
      }

      accessCache[cacheKey] = hasAccessToIndicator;
    }

    if (hasAccessToIndicator) {
      filteredIndicators.push(indicator);
    }
  }

  return filteredIndicators;
};

export const assertIndicatorsPermissions = async (accessPolicy, models, indicators) => {
  const filteredIndicators = await filterIndicatorsByPermissions(accessPolicy, models, indicators);

  if (filteredIndicators.length !== indicators.length) {
    throw new Error('You do not have permissions for the requested indicator(s)');
  }

  return true;
};
