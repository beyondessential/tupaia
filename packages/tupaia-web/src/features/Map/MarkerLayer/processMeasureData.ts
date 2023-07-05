/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import camelCase from 'camelcase';
import { calculateRadiusScaleFactor, getMeasureDisplayInfo } from '@tupaia/ui-map-components';

export const processMeasureData = ({
  entityType,
  measureData,
  entitiesData,
  serieses,
  hiddenValues,
}) => {
  const displayOnLevel = serieses.find(series => series.displayOnLevel);
  if (displayOnLevel && camelCase(entityType) !== camelCase(displayOnLevel.displayOnLevel)) {
    return null;
  }

  const radiusScaleFactor = calculateRadiusScaleFactor(measureData);

  return entitiesData.map(entity => {
    const measure = measureData.find(e => e.organisationUnitCode === entity.code);
    const { color, icon, originalValue, isHidden, radius } = getMeasureDisplayInfo(
      measure,
      serieses,
      hiddenValues,
      radiusScaleFactor,
    );

    return {
      ...entity,
      ...measure,
      isHidden,
      radius,
      organisationUnitCode: entity.code,
      coordinates: entity.point,
      region: entity.region,
      color,
      icon,
      originalValue,
    };
  });
};
