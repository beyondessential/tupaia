/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import RightIcon from '@material-ui/icons/KeyboardArrowRight';
import { WHITE, TRANS_BLACK_LESS, TRANS_BLACK } from '../../../styles';
import { tileSetShape } from '../contants';

const StyledButton = styled(Button)`
  display: block;
  pointer-events: auto;
  background: #2b2d38;
  background: ${TRANS_BLACK};
  color: ${WHITE};
  margin-top: 10px;
  margin-bottom: 1rem;
  border-radius: 3px;
  padding: 5px 15px 5px 5px;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  border: none;

  img {
    height: 25px;
    margin-right: 8px;
  }

  .MuiSvgIcon-root {
    margin-right: -15px;
    color: white;
    transition: color 0.3s ease;
  }

  &:hover {
    background: ${TRANS_BLACK_LESS};
    box-shadow: none;

    .MuiSvgIcon-root {
      color: #2196f3;
    }
  }
`;

const Label = styled.span`
  width: 90px;
  text-align: left;
`;

const Divider = styled.span`
  opacity: 0.2;
  border-right: 1px solid #ffffff;
  height: 25px;
  margin-left: 5px;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
`;

const LegendColor = styled.div`
  border-radius: 50%;
  width: 12px;
  height: 12px;
  background: ${item => item.color};
  margin-right: 5px;
`;

const LegendLabel = styled(Typography)`
  font-size: 12px;
  line-height: 14px;
  color: white;
  text-transform: none;
  margin-bottom: 5px;
`;

export const TileControl = ({ tileSet, ...props }) => (
  <StyledButton variant="contained" {...props}>
    <Box display="flex" alignItems="center">
      <img src={tileSet.thumbnail} alt="tile" />
      <Label>{tileSet.label}</Label>
      <Divider />
      <RightIcon />
      <RightIcon />
    </Box>
    {tileSet.legendItems && (
      <Box pt={1}>
        {tileSet.legendItems.map(item => (
          <Legend key={item.color}>
            <LegendColor color={item.color} />
            <LegendLabel>{item.label}</LegendLabel>
          </Legend>
        ))}
      </Box>
    )}
  </StyledButton>
);

TileControl.propTypes = {
  tileSet: PropTypes.shape(tileSetShape).isRequired,
};
