/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

const Key = styled.div`
  padding: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  pointer-events: auto;
  cursor: pointer;
  ${p => (p.hidden ? 'opacity: 0.5;' : '')}
`;

const LegendEntry = ({ marker, label, value, dataKey, onClick, hiddenMeasures }) => {
  const hidden = (hiddenMeasures[dataKey] || {})[value];

  return (
    <Key onClick={() => onClick(dataKey, value, !hidden)} hidden={hidden}>
      {marker}
      <div>{label}</div>
    </Key>
  );
};

const mapLegendStateToProps = () => {
  return state => ({
    hiddenMeasures: state.map.measureInfo.hiddenMeasures,
  });
};

const mapLegendDispatchToProps = () => {
  return dispatch => ({
    onClick: (key, value, hide) =>
      dispatch({
        key,
        value,
        type: hide ? 'HIDE_MAP_MEASURE' : 'UNHIDE_MAP_MEASURE',
      }),
  });
};

LegendEntry.propTypes = {
  marker: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  dataKey: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  hiddenMeasures: PropTypes.object.isRequired,
};

export default connect(mapLegendStateToProps, mapLegendDispatchToProps)(LegendEntry);
