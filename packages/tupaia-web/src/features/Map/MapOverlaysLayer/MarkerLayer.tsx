/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import {
  MeasureMarker,
  LayerGroup,
  MeasurePopup,
  MeasureData,
  Series,
} from '@tupaia/ui-map-components';
import { useNavigateToEntity } from '../utils';

interface MarkerLayerProps {
  measureData: MeasureData[];
  serieses: Series[];
}

export const MarkerLayer = ({ measureData = [], serieses = [] }: MarkerLayerProps) => {
  const navigateToEntity = useNavigateToEntity();
  const markerMeasures = measureData.filter(m => !!m.point && !m.isHidden);

  return (
    <LayerGroup>
      {markerMeasures.map((measure: MeasureData) => {
        const { organisationUnitCode: entity } = measure;
        return (
          <MeasureMarker key={entity} {...(measure as MeasureData)}>
            <MeasurePopup
              markerData={measure as MeasureData}
              serieses={serieses}
              onSeeOrgUnitDashboard={() => navigateToEntity(entity)}
            />
          </MeasureMarker>
        );
      })}
    </LayerGroup>
  );
};
