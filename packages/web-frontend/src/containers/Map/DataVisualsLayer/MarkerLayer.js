/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  MeasureMarker,
  MeasurePopup,
  MEASURE_TYPE_RADIUS,
  LayerGroup,
} from '@tupaia/ui-map-components';
import { selectMeasureOptions } from '../../../selectors';

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

const UIMarkerLayer = ({
  measureData,
  serieses,
  multiOverlayMeasureData,
  multiOverlaySerieses,
  onSeeOrgUnitDashboard,
}) => {
  if (!measureData || !serieses) return null;

  const data = processData(measureData, serieses);

  return (
    <LayerGroup>
      {data.map(measure => {
        // Need to show all values on tooltips even though we toggle off one map overlay
        const markerData = {
          ...measure,
          ...(multiOverlayMeasureData &&
            multiOverlayMeasureData.find(
              ({ organisationUnitCode }) => organisationUnitCode === measure.organisationUnitCode,
            )),
        };
        return (
          <MeasureMarker key={measure.organisationUnitCode} {...measure}>
            <MeasurePopup
              markerData={markerData}
              serieses={serieses}
              onSeeOrgUnitDashboard={onSeeOrgUnitDashboard}
              multiOverlaySerieses={multiOverlaySerieses}
            />
          </MeasureMarker>
        );
      })}
    </LayerGroup>
  );
};

export const MarkerLayerComponent = props => {
  const {
    measureData,
    serieses,
    displayedMapOverlayCodes,
    multiOverlayMeasureData,
    multiOverlaySerieses,
    onChangeOrgUnit,
    onSeeOrgUnitDashboard,
  } = props;

  if (!displayedMapOverlayCodes) {
    return null;
  }

  // Only show data with valid coordinates. Note: this also removes region data
  const processedData = measureData.filter(
    ({ coordinates }) => coordinates && coordinates.length === 2,
  );

  return (
    <UIMarkerLayer
      measureData={processedData}
      serieses={serieses}
      onChangeOrgUnit={onChangeOrgUnit}
      onSeeOrgUnitDashboard={onSeeOrgUnitDashboard}
      multiOverlayMeasureData={multiOverlayMeasureData}
      multiOverlaySerieses={multiOverlaySerieses}
    />
  );
};

MarkerLayerComponent.propTypes = {
  measureData: PropTypes.array,
  serieses: PropTypes.array,
  displayedMapOverlayCodes: PropTypes.array,
  multiOverlayMeasureData: PropTypes.array,
  multiOverlaySerieses: PropTypes.array,
  onChangeOrgUnit: PropTypes.func.isRequired,
  onSeeOrgUnitDashboard: PropTypes.func.isRequired,
};

MarkerLayerComponent.defaultProps = {
  measureData: [],
  serieses: [],
  displayedMapOverlayCodes: null,
  multiOverlayMeasureData: [],
  multiOverlaySerieses: [],
};

const mapStateToProps = (state, ownProps) => {
  const { displayedMapOverlayCodes } = ownProps;
  const serieses = selectMeasureOptions(state, displayedMapOverlayCodes);
  return {
    serieses,
  };
};

export const MarkerLayer = connect(mapStateToProps)(MarkerLayerComponent);
