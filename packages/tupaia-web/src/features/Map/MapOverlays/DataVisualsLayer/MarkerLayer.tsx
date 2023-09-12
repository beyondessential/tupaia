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

interface MarkerLayerProps {
  measureData: MeasureData[];
  navigateToEntity: (entityCode?: string) => void;
  serieses: Series[];
}

export const MarkerLayer = ({ measureData, serieses, navigateToEntity }: MarkerLayerProps) => {
  const markerMeasures = measureData.filter(m => !!m.point);
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
