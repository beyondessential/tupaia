/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { MarkerLayer } from './MarkerLayer';

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
    displayedMapOverlayCode,
    onChangeOrgUnit,
    multiOverlayMeasureData,
    multiOverlaySerieses,
  } = props;

  return (
    <>
      <InteractivePolygonLayer
        hasMeasureData={measureData && measureData.length > 0}
        displayedMapOverlayCode={displayedMapOverlayCode}
        onChangeOrgUnit={onChangeOrgUnit}
        multiOverlayMeasureData={multiOverlayMeasureData}
        multiOverlaySerieses={multiOverlaySerieses}
      />
      <MarkerLayer
        measureData={measureData}
        displayedMapOverlayCode={displayedMapOverlayCode}
        onChangeOrgUnit={onChangeOrgUnit}
        multiOverlayMeasureData={multiOverlayMeasureData}
        multiOverlaySerieses={multiOverlaySerieses}
      />
    </>
  );
};

DataVisualsLayerComponent.propTypes = {
  measureData: PropTypes.array,
  displayedMapOverlayCode: PropTypes.string.isRequired,
  multiOverlayMeasureData: PropTypes.array,
  multiOverlaySerieses: PropTypes.array,
  onChangeOrgUnit: PropTypes.func.isRequired,
};

DataVisualsLayerComponent.defaultProps = {
  measureData: [],
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

const mapStateToProps = (state, ownProps) => {
  const { displayedMapOverlayCode } = ownProps;
  const mapOverlayCodes = selectCurrentMapOverlayCodes(state);
  const measureData = selectMeasureDataWithCoordinates(
    selectRenderedMeasuresWithDisplayInfo(state, [displayedMapOverlayCode]),
  );
  // orginal data
  const multiOverlayMeasureData = selectMeasureData(state, mapOverlayCodes);
  const multiOverlaySerieses = selectMeasureOptions(state, mapOverlayCodes);

  return {
    measureData,
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
  return (
    JSON.stringify(prevProps.measureData) === JSON.stringify(nextProps.measureData) &&
    prevProps.displayedMapOverlayCode === nextProps.displayedMapOverlayCode
  );
};

export const DataVisualsLayer = memo(
  connect(mapStateToProps, mapDispatchToProps)(DataVisualsLayerComponent),
  propsAreEqual,
);
