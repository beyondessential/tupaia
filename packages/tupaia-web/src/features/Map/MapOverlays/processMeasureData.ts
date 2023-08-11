/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  calculateRadiusScaleFactor,
  getMeasureDisplayInfo,
  LegendProps,
  MeasureData,
  Series,
  MEASURE_TYPE_RADIUS,
} from '@tupaia/ui-map-components';
import { Entity } from '@tupaia/types';

interface processMeasureDataProps {
  measureData: MeasureData[];
  entitiesData: Entity[];
  serieses: Series[];
  hiddenValues: LegendProps['hiddenValues'];
  includeEntitiesWithoutCoordinates?: boolean; // this is for differentiating between the processing of data for the table and for the map
}
export const processMeasureData = ({
  measureData,
  entitiesData,
  serieses,
  hiddenValues,
  includeEntitiesWithoutCoordinates,
}: processMeasureDataProps) => {
  const radiusScaleFactor = calculateRadiusScaleFactor(measureData);
  const entityMeasureData = entitiesData.map((entity: Entity) => {
    const measure = measureData.find(
      (measureEntity: any) => measureEntity.organisationUnitCode === entity.code,
    );
    const { color, icon, originalValue, isHidden, radius } = getMeasureDisplayInfo(
      measure!,
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

  // for radius overlay sort desc radius to place smaller circles over larger circles
  if (serieses.some(l => l.type === MEASURE_TYPE_RADIUS)) {
    entityMeasureData.sort((a, b) => Number(b.radius) - Number(a.radius));
  }

  // Filter hidden and invalid values and sort measure data
  return entityMeasureData
    .filter(({ coordinates, region }) =>
      includeEntitiesWithoutCoordinates
        ? true
        : region || (coordinates && coordinates?.length === 2),
    )
    .filter(({ isHidden }) => !isHidden);
};
