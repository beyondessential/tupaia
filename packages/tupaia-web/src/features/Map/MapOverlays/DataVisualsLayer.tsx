/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import {
  LegendProps,
  MeasureMarker,
  LayerGroup,
  MeasurePopup,
  Polygon,
  AreaTooltip,
  MeasureData,
} from '@tupaia/ui-map-components';
import { useEntity, useProject } from '../../../api/queries';
import { useMapOverlayReport, useMapOverlayData } from '../utils';
import { EntityCode } from '../../../types';

const ShadedPolygon = styled(Polygon)`
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

const useNavigateToEntity = () => {
  const { projectCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: project } = useProject(projectCode);

  return (entityCode?: EntityCode) => {
    const link = {
      ...location,
      pathname: `/${projectCode}/${entityCode}/${project?.dashboardGroupName}`,
    };
    navigate(link);
  };
};

export const DataVisualsLayer = ({
  hiddenValues,
}: {
  hiddenValues: LegendProps['hiddenValues'];
}) => {
  const navigateToEntity = useNavigateToEntity();
  const { projectCode, entityCode } = useParams();
  const { data: mapOverlayData } = useMapOverlayReport();
  const { data: entity } = useEntity(projectCode, entityCode);
  const { serieses, processedMeasureData } = useMapOverlayData(
    projectCode,
    entityCode,
    hiddenValues,
  );
  const popUpSerieses = mapOverlayData?.serieses;

  // Don't show the marker layer if the entity type doesn't match the measure level
  const firstSeries = mapOverlayData?.serieses?.find((series: any) => series.displayOnLevel);
  if (firstSeries && camelCase(entity?.type!) !== camelCase(firstSeries.displayOnLevel)) {
    return null;
  }

  if (!processedMeasureData || !mapOverlayData?.serieses) {
    return null;
  }

  return (
    <LayerGroup>
      {processedMeasureData.map(measure => {
        const { region, organisationUnitCode: entity, color, name } = measure;
        if (region) {
          return (
            <ShadedPolygon
              key={entity}
              positions={region}
              pathOptions={{
                color: color,
                fillColor: color,
              }}
              eventHandlers={{
                click: () => {
                  navigateToEntity(entity);
                },
              }}
              {...measure}
            >
              <AreaTooltip
                serieses={serieses}
                orgUnitMeasureData={measure as MeasureData}
                orgUnitName={name}
                hasMeasureValue
              />
            </ShadedPolygon>
          );
        }

        return (
          <MeasureMarker key={entity} {...(measure as MeasureData)}>
            <MeasurePopup
              markerData={measure as MeasureData}
              serieses={popUpSerieses}
              onSeeOrgUnitDashboard={navigateToEntity}
            />
          </MeasureMarker>
        );
      })}
    </LayerGroup>
  );
};
