/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { MarkerLayer as UIMarkerLayer } from '@tupaia/ui-components';
import { connect } from 'react-redux';

import { selectMeasureOptions } from '../../../selectors';

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
