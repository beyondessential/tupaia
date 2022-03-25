/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { MarkerLayer } from '@tupaia/ui-components/lib/map';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import {
  selectCurrentMapOverlayCodes,
  selectMeasureOptions,
  selectRenderedMeasuresWithDisplayInfo,
  selectMeasureData,
} from '../../../selectors';
import { setOrgUnit } from '../../../actions';
import { InteractivePolygonLayer } from './InteractivePolygonLayer';

export const DataVisualsLayerComponent = props => {
  const {
    measureData,
    hasMeasureData,
    onChangeOrgUnit,
    serieses,
    multiOverlayMeasureData,
    multiOverlaySerieses,
  } = props;
  // Only show data with valid coordinates. Note: this also removes region data
  const processedData = measureData.filter(
    ({ coordinates }) => coordinates && coordinates.length === 2,
  );

  return (
    <>
      <InteractivePolygonLayer
        hasMeasureData={hasMeasureData}
        onChangeOrgUnit={onChangeOrgUnit}
        multiOverlayMeasureData={multiOverlayMeasureData}
        multiOverlaySerieses={multiOverlaySerieses}
      />
      <MarkerLayer
        measureData={processedData}
        serieses={serieses || null}
        onChangeOrgUnit={onChangeOrgUnit}
        multiOverlayMeasureData={multiOverlayMeasureData}
        multiOverlaySerieses={multiOverlaySerieses}
      />
    </>
  );
};

DataVisualsLayerComponent.propTypes = {
  measureData: PropTypes.array,
  hasMeasureData: PropTypes.bool,
  serieses: PropTypes.array,
  multiOverlayMeasureData: PropTypes.array,
  multiOverlaySerieses: PropTypes.array,
  onChangeOrgUnit: PropTypes.func.isRequired,
};

DataVisualsLayerComponent.defaultProps = {
  measureData: [],
  hasMeasureData: false,
  serieses: [],
  multiOverlayMeasureData: [],
  multiOverlaySerieses: [],
};

const selectMeasureDataWithCoordinates = createSelector([measureData => measureData], measureData =>
  measureData.map(({ location, ...otherData }) => ({
    ...otherData,
    coordinates: location && location.point,
    region: location && location.region,
  })),
);

const mapStateToProps = state => {
  const { displayedMapOverlays } = state.map;
  const mapOverlayCodes = selectCurrentMapOverlayCodes(state);
  const measureData = selectMeasureDataWithCoordinates(
    selectRenderedMeasuresWithDisplayInfo(state, displayedMapOverlays),
  );
  const hasMeasureData = measureData && measureData.length > 0;
  const serieses = selectMeasureOptions(state, displayedMapOverlays);
  // orginal data
  const multiOverlayMeasureData = selectMeasureData(state, mapOverlayCodes);
  const multiOverlaySerieses = selectMeasureOptions(state, mapOverlayCodes);

  return {
    measureData,
    hasMeasureData,
    serieses,
    multiOverlayMeasureData,
    multiOverlaySerieses,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
});

const propsAreEqual = (prevProps, nextProps) => {
  if (JSON.stringify(prevProps.serieses) !== JSON.stringify(nextProps.serieses)) return true;

  if (JSON.stringify(prevProps.measureData) !== JSON.stringify(nextProps.measureData)) return true;

  return false;
};

export const DataVisualsLayer = memo(
  connect(mapStateToProps, mapDispatchToProps)(DataVisualsLayerComponent),
  propsAreEqual,
);
