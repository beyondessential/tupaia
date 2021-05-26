/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import RightIcon from '@material-ui/icons/KeyboardArrowRight';
import { tileSetShape } from './constants';

const StyledButton = styled(Button)`
  display: block;
  pointer-events: auto;
  box-shadow: none;
  background: ${({ theme }) =>
    theme.palette.type === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(43, 45, 56, 0.9)'};
  color: ${({ theme }) => (theme.palette.type === 'light' ? theme.palette.text.primary : 'white')};
  margin-top: 0.6rem;
  margin-bottom: 1rem;
  border-radius: 3px;
  padding: 0.3125rem 0.9rem 0.3125rem 0.3125rem;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 0.85rem;
  border: none;
  text-transform: none;

  img {
    height: 1.5rem;
    margin-right: 0.5rem;
  }

  .MuiSvgIcon-root {
    margin-right: -0.9rem;
    color: ${({ theme }) =>
      theme.palette.type === 'light' ? theme.palette.text.secondary : 'white'};
    transition: color 0.3s ease;
  }

  &:hover {
    box-shadow: none;
    background: ${({ theme }) =>
      theme.palette.type === 'light' ? 'white' : 'rgba(43, 45, 56, 0.8)'};
    color: ${({ theme }) =>
      theme.palette.type === 'light' ? theme.palette.text.primary : 'white'};

    .MuiSvgIcon-root {
      color: ${({ theme }) =>
        theme.palette.type === 'light' ? theme.palette.primary.main : 'white'};
    }
  }
`;

const Label = styled.span`
  width: 4.65rem;
  text-align: left;
  letter-spacing: 0;
`;

const Divider = styled.span`
  border-right: 1px solid
    ${({ theme }) => (theme.palette.type === 'light' ? theme.palette.grey['400'] : 'white')};
  height: 1.5rem;
  margin-left: 0.3rem;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
`;

const LegendColor = styled.div`
  border-radius: 50%;
  width: 0.75rem;
  height: 0.75rem;
  background: ${item => item.color};
  margin-right: 0.3rem;
`;

const LegendLabel = styled(Typography)`
  font-size: 0.75rem;
  line-height: 0.85rem;
  color: ${({ theme }) =>
    theme.palette.type === 'light' ? theme.palette.text.secondary : 'white'};
  text-transform: none;
  margin-bottom: 0.3rem;
`;

export const TileControl = React.memo(({ tileSet, isActive, ...props }) => (
  <StyledButton variant="contained" active={isActive.toString()} {...props}>
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
));

TileControl.propTypes = {
  tileSet: PropTypes.shape(tileSetShape).isRequired,
  isActive: PropTypes.bool,
};

TileControl.defaultProps = {
  isActive: false,
};
