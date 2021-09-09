/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { PRIMARY_BLUE } from '../../../styles';
import { tileSetShape } from '../contants';
import { ReferenceTooltip, TOOLTIP_ICON_STYLE_OPTIONS } from '../../../components/ReferenceTooltip';

const StyledButton = styled(Button)`
  position: relative;
  border-radius: 3px;
  margin: 1rem;
  font-size: 0;
  overflow: hidden;
  padding: 0;
  text-transform: none;
  width: 160px;
  height: 140px;
  min-height: 140px;
  background-size: cover;
  transition: none;

  &:hover {
    div {
      opacity: 1;
    }
  }

  &.active {
    border: 2px solid ${PRIMARY_BLUE};

    div {
      opacity: 1;
    }

    p {
      background: ${PRIMARY_BLUE};
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
  font-size: 14px;
  line-height: 19px;
  color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #2b2d38;
  padding: 8px 12px;
  opacity: 0.9;
  align-items: center;
  justify-content: space-between;
`;

export const TileButton = ({ tileSet, isActive, onChange }) => (
  <StyledButton onClick={() => onChange(tileSet.key)} className={isActive ? 'active' : ''}>
    <Thumbnail style={{ backgroundImage: `url(${tileSet.thumbnail})` }} />
    <TileLabel>
      {tileSet.label}
      {tileSet.reference && (
        <ReferenceTooltip
          reference={tileSet.reference}
          iconStyleOption={TOOLTIP_ICON_STYLE_OPTIONS.TILE_SET}
        />
      )}
    </TileLabel>
  </StyledButton>
);

TileButton.propTypes = {
  tileSet: PropTypes.shape(tileSetShape).isRequired,
  isActive: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

TileButton.defaultProps = {
  isActive: false,
};
