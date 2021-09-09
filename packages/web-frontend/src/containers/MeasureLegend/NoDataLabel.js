/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getMarkerForOption } from '../../components/Marker';
import { LEGEND_SHADING_ICON } from '../../components/Marker/markerIcons';
import LegendEntry from './LegendEntry';

const NoDataLabel = ({ noDataColour, valueMapping, dataKey }) => {
  const { value } = valueMapping.null;
  const marker = getMarkerForOption(LEGEND_SHADING_ICON, noDataColour);

  return <LegendEntry marker={marker} label="No data" value={value} dataKey={dataKey} />;
};

NoDataLabel.propTypes = {
  noDataColour: PropTypes.string.isRequired,
  valueMapping: PropTypes.object.isRequired,
  dataKey: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  dataKey: state.map.measureInfo.measureOptions['0'].key,
});

export default connect(mapStateToProps)(NoDataLabel);
