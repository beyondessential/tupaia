/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { lighten } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const CircleCell = styled.div`
  display: flex;
  justify-content: center;
  width: 115px;
  padding: 0;
  border-right: none;
`;

const CircleComponent = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 5px solid ${props => lighten(props.color, 0.6)};
`;

export const ColorCircle = ({ displayConfig }) => {
  if (!displayConfig) {
    return (
      <CircleCell>
        <CircleComponent color="#a1aaaf" />
      </CircleCell>
    );
  }

  const { color } = displayConfig;

  return (
    <CircleCell>
      <CircleComponent color={color} />
    </CircleCell>
  );
};

ColorCircle.propTypes = {
  displayConfig: PropTypes.shape({
    color: PropTypes.string.isRequired,
  }).isRequired,
};
