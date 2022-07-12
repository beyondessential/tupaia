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
import { setMobileTab, setOrgUnit } from '../../../actions';
import { InteractivePolygonLayer } from './InteractivePolygonLayer';

export const DataVisualsLayerComponent = props => {
  const {
    measureData,
    displayedMapOverlayCodes,
    onChangeOrgUnit,
    onSeeOrgUnitDashboard,
    multiOverlayMeasureData,
    multiOverlaySerieses,
  } = props;

  const sharedProps = {
    onChangeOrgUnit,
    displayedMapOverlayCodes,
    multiOverlayMeasureData,
    multiOverlaySerieses,
  };

  return (
    <>
      <InteractivePolygonLayer
        hasMeasureData={measureData && measureData.length > 0}
        {...sharedProps}
      />
      <MarkerLayer
        measureData={measureData}
        onSeeOrgUnitDashboard={onSeeOrgUnitDashboard}
        {...sharedProps}
      />
    </>
  );
};

DataVisualsLayerComponent.propTypes = {
  measureData: PropTypes.array,
  displayedMapOverlayCodes: PropTypes.array,
  multiOverlayMeasureData: PropTypes.array,
  multiOverlaySerieses: PropTypes.array,
  onChangeOrgUnit: PropTypes.func.isRequired,
  onSeeOrgUnitDashboard: PropTypes.func.isRequired,
};

DataVisualsLayerComponent.defaultProps = {
  measureData: [],
  multiOverlayMeasureData: [],
  multiOverlaySerieses: [],
  displayedMapOverlayCodes: [],
};

const selectMeasureDataWithCoordinates = createSelector([measureData => measureData], measureData =>
  measureData.map(({ location, ...otherData }) => ({
    ...otherData,
    coordinates: location && location.point,
    region: location && location.region,
  })),
);

const mapStateToProps = (state, ownProps) => {
  const { isMeasureLoading } = state.map;
  const { displayedMapOverlayCodes } = ownProps;
  const mapOverlayCodes = selectCurrentMapOverlayCodes(state);
  const measureData = selectMeasureDataWithCoordinates(
    selectRenderedMeasuresWithDisplayInfo(state, displayedMapOverlayCodes),
  );
  // orginal data
  const multiOverlayMeasureData = selectMeasureData(state, mapOverlayCodes);
  const multiOverlaySerieses = selectMeasureOptions(state, mapOverlayCodes);

  return {
    isMeasureLoading,
    measureData,
    multiOverlayMeasureData,
    multiOverlaySerieses,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
  onSeeOrgUnitDashboard: organisationUnitCode => {
    dispatch(setOrgUnit(organisationUnitCode, true));
    dispatch(setMobileTab('dashboard'));
  },
});

const propsAreEqual = (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.measureData) === JSON.stringify(nextProps.measureData) &&
    JSON.stringify(prevProps.displayedMapOverlayCodes) ===
      JSON.stringify(nextProps.displayedMapOverlayCodes)
  );
};

export const DataVisualsLayer = memo(
  connect(mapStateToProps, mapDispatchToProps)(DataVisualsLayerComponent),
  propsAreEqual,
);
