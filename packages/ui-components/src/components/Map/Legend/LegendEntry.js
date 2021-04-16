/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const Entry = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.3rem;
  pointer-events: auto;
  cursor: pointer;
  ${p => (p.hidden ? 'opacity: 0.5;' : '')}
`;

export const LegendEntry = React.memo(
  ({ marker, label, value, onClick, hiddenValues, unClickable }) => {
    const hidden = hiddenValues.includes(value);

    const handleClick = () => {
      if (!unClickable && onClick) {
        onClick(value);
      }
    };

    return (
      <Entry onClick={handleClick} hidden={hidden}>
        {marker}
        <div>{label}</div>
      </Entry>
    );
  },
);

LegendEntry.propTypes = {
  marker: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  hiddenValues: PropTypes.array,
  onClick: PropTypes.func,
  unClickable: PropTypes.bool,
};

LegendEntry.defaultProps = {
  hiddenValues: [],
  unClickable: false,
  onClick: null,
  value: null,
};
