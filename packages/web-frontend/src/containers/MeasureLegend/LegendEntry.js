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

const LegendEntry = React.memo(
  ({ marker, label, value, dataKey, onClick, hiddenMeasures, unClickable }) => {
    const hidden = (hiddenMeasures[dataKey] || {})[value];

    return (
      <Key onClick={unClickable ? null : () => onClick(dataKey, value, !hidden)} hidden={hidden}>
        {marker}
        <div>{label}</div>
      </Key>
    );
  },
);

LegendEntry.propTypes = {
  marker: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  dataKey: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  hiddenMeasures: PropTypes.object.isRequired,
  unClickable: PropTypes.bool,
};

LegendEntry.defaultProps = {
  unClickable: false,
  value: null,
};

const mapStateToProps = () => state => ({
  hiddenMeasures: state.map.measureInfo.hiddenMeasures,
});

const mapDispatchToProps = () => dispatch => ({
  onClick: (key, value, hide) =>
    dispatch({
      key,
      value,
      type: hide ? 'HIDE_MAP_MEASURE' : 'UNHIDE_MAP_MEASURE',
    }),
});

export default connect(mapStateToProps, mapDispatchToProps)(LegendEntry);
