/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { tileSetShape } from './constants';

const StyledButton = styled(Button)`
  position: relative;
  border-radius: 3px;
  margin: 1rem;
  font-size: 0;
  overflow: hidden;
  padding: 0;
  text-transform: none;
  width: 1orem;
  height: 8.75rem;
  min-height: 8.75rem;
  background-size: cover;
  transition: none;

  &:hover {
    div {
      opacity: 1;
    }
  }

  &.active {
    border: 2px solid #2196f3;

    div {
      opacity: 1;
    }

    p {
      background: #2196f3;
    }
  }

  img {
    border-radius: 3px;
    width: 100%;
  }
`;

const Thumbnail = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0.85;
  background-size: cover;
  transition: opacity 0.3s ease;
`;

const TileLabel = styled(Typography)`
  font-weight: normal;
  font-size: 1rem;
  line-height: 1.2rem;
  color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #2b2d38;
  padding: 0.5rem 0.75rem;
  opacity: 0.9;
`;

export const TileButton = React.memo(({ tileSet, isActive, onChange }) => (
  <StyledButton onClick={() => onChange(tileSet.key)} className={isActive ? 'active' : ''}>
    <Thumbnail style={{ backgroundImage: `url(${tileSet.thumbnail})` }} />
    <TileLabel>{tileSet.label}</TileLabel>
  </StyledButton>
));

TileButton.propTypes = {
  tileSet: PropTypes.shape(tileSetShape).isRequired,
  isActive: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

TileButton.defaultProps = {
  isActive: false,
};
