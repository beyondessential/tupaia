/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Key = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.3rem 0.3rem;
  pointer-events: auto;
  margin-bottom: 0.1rem;
  cursor: pointer;
  opacity: ${props => (props.hidden ? '0.5' : '1')};
`;

const Label = styled.div`
  font-size: 0.875rem;
`;

export const LegendEntry = React.memo(
  ({ marker, label, value, dataKey, onClick, hiddenValues, unClickable }) => {
    const hidden = (hiddenValues[dataKey] || {})[value];

    const handleClick = () => {
      if (!unClickable && onClick) {
        onClick(dataKey, value, !hidden);
      }
    };

    return (
      <Key onClick={handleClick} hidden={hidden}>
        {marker}
        <Label>{label}</Label>
      </Key>
    );
  },
);

LegendEntry.propTypes = {
  marker: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  dataKey: PropTypes.string,
  hiddenValues: PropTypes.object,
  onClick: PropTypes.func,
  unClickable: PropTypes.bool,
};

LegendEntry.defaultProps = {
  hiddenValues: {},
  unClickable: false,
  onClick: null,
  value: null,
  dataKey: null,
};
