/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const Key = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.3rem;
  pointer-events: auto;
  cursor: pointer;
  ${p => (p.hidden ? 'opacity: 0.5;' : '')}
`;

export const LegendEntry = React.memo(
  ({ marker, label, value, dataKey, hideByDefault, onClick, unClickable }) => (
    <Key
      onClick={unClickable || !onClick ? null : () => onClick(dataKey, value, !hideByDefault)}
      hidden={hideByDefault}
    >
      {marker}
      <div>{label}</div>
    </Key>
  ),
);

LegendEntry.propTypes = {
  marker: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  dataKey: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  hideByDefault: PropTypes.bool,
  unClickable: PropTypes.bool,
};

LegendEntry.defaultProps = {
  unClickable: false,
  hideByDefault: false,
  onClick: null,
  value: null,
};
