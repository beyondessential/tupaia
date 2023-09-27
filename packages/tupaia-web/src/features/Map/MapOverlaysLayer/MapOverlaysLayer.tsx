/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { LegendProps } from '@tupaia/ui-map-components';
import { useMapOverlayMapData } from '../utils';
import { PolygonLayer } from './PolygonLayer';
import { MarkerLayer } from './MarkerLayer';

export const MapOverlaysLayer = ({
  hiddenValues,
}: {
  hiddenValues: LegendProps['hiddenValues'];
}) => {
  const { serieses, measureData, isLoading } = useMapOverlayMapData(hiddenValues);
  return (
    <>
      <PolygonLayer measureData={measureData} serieses={serieses} />
      {isLoading ? null : <MarkerLayer measureData={measureData} serieses={serieses} />}
    </>
  );
};
