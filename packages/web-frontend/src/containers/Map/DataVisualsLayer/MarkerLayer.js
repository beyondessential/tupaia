/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { MarkerLayer as UIMarkerLayer } from '@tupaia/ui-components/lib/map';
import { connect } from 'react-redux';

import { selectMeasureOptions } from '../../../selectors';

export const MarkerLayerComponent = props => {
  const {
    measureData,
    serieses,
    displayedMapOverlayCode,
    multiOverlayMeasureData,
    multiOverlaySerieses,
    onChangeOrgUnit,
  } = props;

  if (!displayedMapOverlayCode) {
    return null;
  }

  // Only show data with valid coordinates. Note: this also removes region data
  const processedData = measureData.filter(
    ({ coordinates }) => coordinates && coordinates.length === 2,
  );

  return (
    <UIMarkerLayer
      measureData={processedData}
      serieses={serieses || null}
      onChangeOrgUnit={onChangeOrgUnit}
      multiOverlayMeasureData={multiOverlayMeasureData}
      multiOverlaySerieses={multiOverlaySerieses}
    />
  );
};

MarkerLayerComponent.propTypes = {
  measureData: PropTypes.array,
  serieses: PropTypes.array,
  displayedMapOverlayCode: PropTypes.array,
  multiOverlayMeasureData: PropTypes.array,
  multiOverlaySerieses: PropTypes.array,
  onChangeOrgUnit: PropTypes.func.isRequired,
};

MarkerLayerComponent.defaultProps = {
  measureData: [],
  serieses: [],
  displayedMapOverlayCode: null,
  multiOverlayMeasureData: [],
  multiOverlaySerieses: [],
};

const mapStateToProps = (state, ownProps) => {
  const { displayedMapOverlayCode } = ownProps;
  const serieses = selectMeasureOptions(state, [displayedMapOverlayCode]);
  return {
    serieses,
  };
};

const propsAreEqual = (prevProps, nextProps) => {
  return (
    prevProps.displayedMapOverlayCode === nextProps.displayedMapOverlayCode &&
    JSON.stringify(prevProps.serieses) === JSON.stringify(nextProps.serieses) &&
    JSON.stringify(prevProps.measureData) === JSON.stringify(nextProps.measureData)
  );
};

export const MarkerLayer = memo(connect(mapStateToProps)(MarkerLayerComponent), propsAreEqual);
