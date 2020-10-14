/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import styled from 'styled-components';
import { getMarkerForOption } from '../../components/Marker';
import { LEGEND_SHADING_ICON } from '../../components/Marker/markerIcons';
import { GREY } from '../../styles';

const iconStyle = {
  marginLeft: '10px',
  pointerEvents: 'auto',
  cursor: 'pointer',
};

export const LabelLeft = styled.div`
  margin-right: 10px;
`;

export const LabelRight = styled.div`
  margin-left: 10px;
`;

const NoDataLabel = ({ noDataColour, handleClick, valueMapping, hiddenMeasures, dataKey }) => {
  const { value } = valueMapping.null;
  const hidden = hiddenMeasures[dataKey] && hiddenMeasures[dataKey][value];
  const noDataLegendColour = hidden ? GREY : noDataColour;

  return (
    <div style={iconStyle} onClick={() => handleClick(dataKey, value, !hidden)}>
      {' '}
      {getMarkerForOption(LEGEND_SHADING_ICON, noDataLegendColour)}
      No data{' '}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    hiddenMeasures: state.map.measureInfo.hiddenMeasures,
    dataKey: state.map.measureInfo.measureOptions['0'].key,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleClick: (key, value, hide) =>
      dispatch({
        key,
        value,
        type: hide ? 'HIDE_MAP_MEASURE' : 'UNHIDE_MAP_MEASURE',
      }),
  };
};

NoDataLabel.propTypes = {
  noDataColour: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  valueMapping: PropTypes.arrayOf(PropTypes.object).isRequired,
  hiddenMeasures: PropTypes.shape({}).isRequired,
  dataKey: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(NoDataLabel);
