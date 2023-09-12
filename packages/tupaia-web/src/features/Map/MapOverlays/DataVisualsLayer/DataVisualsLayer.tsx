/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import camelCase from 'camelcase';
import { LegendProps } from '@tupaia/ui-map-components';
import { ErrorBoundary } from '@tupaia/ui-components';
import { useEntity } from '../../../../api/queries';
import { useMapOverlayData, useNavigateToEntity } from '../../utils';
import { PolygonLayer } from './PolygonLayer';
import { MarkerLayer } from './MarkerLayer';

export const DataVisualsLayer = ({
  hiddenValues,
}: {
  hiddenValues: LegendProps['hiddenValues'];
}) => {
  const navigateToEntity = useNavigateToEntity();
  const { projectCode, entityCode } = useParams();
  const { data: entity } = useEntity(projectCode, entityCode);
  const { serieses, measureData } = useMapOverlayData(hiddenValues);

  // Don't show the marker layer if the entity type doesn't match the measure level
  const firstSeries = serieses?.find((series: any) => series.displayOnLevel);
  if (firstSeries && camelCase(entity?.type!) !== camelCase(firstSeries.displayOnLevel)) {
    return null;
  }

  if (!measureData || !serieses) {
    return null;
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};
