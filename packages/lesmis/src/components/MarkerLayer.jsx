import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { LayerGroup, Polygon } from 'react-leaflet';
import {
  MeasureMarker,
  MeasurePopup,
  AreaTooltip,
  getSingleFormattedValue,
  MEASURE_TYPE_RADIUS,
} from '@tupaia/ui-map-components';

const ShadedPolygon = styled(Polygon)`
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

// remove name from the measure data as it's not expected in getSingleFormattedValue
const getTooltipText = (markerData, serieses) =>
  `${markerData.name}: ${getSingleFormattedValue(markerData, serieses)}`;

// Filter hidden and invalid values and sort measure data
const processData = (measureData, serieses) => {
  const data = measureData
    .filter(({ coordinates, region }) => region || (coordinates && coordinates?.length === 2))
    .filter(({ isHidden }) => !isHidden);

  // for radius overlay sort desc radius to place smaller circles over larger circles
  if (serieses.some(l => l.type === MEASURE_TYPE_RADIUS)) {
    data.sort((a, b) => Number(b.radius) - Number(a.radius));
  }

  return data;
};

export const MarkerLayer = ({ measureData, serieses, onSeeOrgUnitDashboard }) => {
  if (!measureData || !serieses) return null;

  const data = processData(measureData, serieses);

  return (
    <LayerGroup>
      {data.map(measure => {
        if (measure.region) {
          return (
            <ShadedPolygon
              key={measure.organisationUnitCode}
              positions={measure.region}
              pathOptions={{
                color: measure.color,
                fillColor: measure.color,
              }}
              {...measure}
            >
              <AreaTooltip text={getTooltipText(measure, serieses)} />
            </ShadedPolygon>
          );
        }

        return (
          <MeasureMarker key={measure.organisationUnitCode} {...measure}>
            <MeasurePopup
              markerData={measure}
              serieses={serieses}
              onSeeOrgUnitDashboard={onSeeOrgUnitDashboard}
            />
          </MeasureMarker>
        );
      })}
    </LayerGroup>
  );
};

MarkerLayer.propTypes = {
  measureData: PropTypes.array,
  serieses: PropTypes.array,
  onSeeOrgUnitDashboard: PropTypes.func,
};

MarkerLayer.defaultProps = {
  measureData: null,
  serieses: null,
  onSeeOrgUnitDashboard: null,
};
