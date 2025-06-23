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
  isLoading?: boolean;
}

export const MarkerLayer = ({ measureData = [], serieses = [], isLoading }: MarkerLayerProps) => {
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
              serieses={isLoading ? [] : serieses}
              onSeeOrgUnitDashboard={() => navigateToEntity(entity)}
            />
          </MeasureMarker>
        );
      })}
    </LayerGroup>
  );
};
