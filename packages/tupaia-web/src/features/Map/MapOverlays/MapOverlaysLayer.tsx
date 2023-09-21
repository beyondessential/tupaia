/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { useEntitiesWithLocation, useEntity, useMapOverlays } from '../../../api/queries';
import { ActiveEntityPolygon } from './ActiveEntityPolygon';
import { useMapOverlayData, useNavigateToEntity } from '../utils';
import { PolygonLayer } from './DataVisualsLayer/PolygonLayer';
import { MarkerLayer } from './DataVisualsLayer/MarkerLayer';
import { POLYGON_MEASURE_TYPES } from '@tupaia/ui-map-components';

export const MapOverlaysLayer = ({ hiddenValues = {} }) => {
  const { projectCode, entityCode } = useParams();
  const navigateToEntity = useNavigateToEntity();
  const { data: activeEntity } = useEntity(projectCode, entityCode);
  const { serieses, measureData } = useMapOverlayData(hiddenValues);

  const isPolygonSerieses = serieses?.some(s => POLYGON_MEASURE_TYPES.includes(s.type));

  return (
    <>
      <PolygonLayer
        measureData={measureData}
        serieses={serieses}
        navigateToEntity={navigateToEntity}
      />
      <MarkerLayer
        measureData={measureData}
        serieses={serieses}
        navigateToEntity={navigateToEntity}
      />
      {/*<ActiveEntityPolygon entity={activeEntity} hasShadedChildren={isPolygonSerieses} />*/}
    </>
  );

  // active entity from the url param
  // child entities where the parent code is the active entity code
  // sibling entities where the parent code is the parent code of the active entity
};
