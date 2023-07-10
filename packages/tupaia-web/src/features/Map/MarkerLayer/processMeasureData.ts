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
} from '@tupaia/ui-map-components';
import { Entity } from '@tupaia/types';

interface processMeasureDataProps {
  measureData: MeasureData[];
  entitiesData: Entity[];
  serieses: Series[];
  hiddenValues: LegendProps['hiddenValues'];
}
export const processMeasureData = ({
  measureData,
  entitiesData,
  serieses,
  hiddenValues,
}: processMeasureDataProps) => {
  const radiusScaleFactor = calculateRadiusScaleFactor(measureData);

  return entitiesData.map((entity: Entity) => {
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
};
