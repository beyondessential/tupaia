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
  POLYGON_MEASURE_TYPES,
} from '@tupaia/ui-map-components';
import { Entity } from '@tupaia/types';

interface processMeasureDataProps {
  measureData: MeasureData[];
  entitiesData: Entity[];
  serieses: Series[];
  hiddenValues: LegendProps['hiddenValues'];
  includeEntitiesWithoutCoordinates?: boolean; // this is for differentiating between the processing of data for the table and for the map
}

const POLYGON_DISPLAY_TYPES = {
  shaded: 'shadedPolygon',
  transparentShaded: 'transparentShadedPolygon',
  basic: 'basicPolygon',
  active: 'activePolygon',
};

export const processMeasureData = ({
  activeEntityCode,
  measureData,
  entitiesData,
  serieses,
  hiddenValues,
  includeEntitiesWithoutCoordinates,
}: processMeasureDataProps) => {
  if (!measureData || !serieses) {
    return entitiesData.map((entity: Entity) => {
      function getDisplayType() {
        if (entity.code === activeEntityCode) {
          return POLYGON_DISPLAY_TYPES.active;
        }
      }
      return {
        ...entity,
        organisationUnitCode: entity.code,
        coordinates: entity.point,
        region: entity.region,
        polygonDisplayType: getDisplayType(),
      };
    });
  }

  const radiusScaleFactor = calculateRadiusScaleFactor(measureData);

  const entityMeasureData = entitiesData.map((entity: Entity) => {
    const measure = measureData.find(
      (measureEntity: any) => measureEntity.organisationUnitCode === entity.code,
    );
    const isPolygonSerieses = serieses.some(s => POLYGON_MEASURE_TYPES.includes(s.type));

    const { color, icon, originalValue, isHidden, radius } = getMeasureDisplayInfo(
      measure!,
      serieses,
      hiddenValues,
      radiusScaleFactor,
    );

    function getDisplayType() {
      if (entity.code === activeEntityCode && !isPolygonSerieses) {
        return POLYGON_DISPLAY_TYPES.active;
      }
      if (isHidden) {
        return POLYGON_DISPLAY_TYPES.basic;
      }
      if (isPolygonSerieses) {
        return POLYGON_DISPLAY_TYPES.shaded;
      }
    }

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
      polygonDisplayType: getDisplayType(),
    };
  });

  // for radius overlay sort desc radius to place smaller circles over larger circles
  if (serieses.some(l => l.type === MEASURE_TYPE_RADIUS)) {
    entityMeasureData.sort((a, b) => Number(b.radius) - Number(a.radius));
  }

  // Filter hidden and invalid values and sort measure data
  return entityMeasureData.filter(({ coordinates, region }) =>
    includeEntitiesWithoutCoordinates ? true : region || (coordinates && coordinates?.length === 2),
  );
};
