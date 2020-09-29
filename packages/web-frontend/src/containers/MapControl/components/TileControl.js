/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import RightIcon from '@material-ui/icons/KeyboardArrowRight';
import { OFF_WHITE, TRANS_BLACK_LESS } from '../../../styles';
import { tileSetShape } from '../contants';

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  pointer-events: auto;
  background: #2b2d38;
  background: ${TRANS_BLACK_LESS};
  //color: white;
  color: ${OFF_WHITE};
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-radius: 3px;
  padding: 5px 15px 5px 5px;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  border: none;

  img {
    height: 25px;
    margin-right: 5px;
  }

  .MuiSvgIcon-root {
    margin-right: -15px;
    color: #2196f3;
  }
`;

const Label = styled.span`
  width: 80px;
`;

const Divider = styled.span`
  opacity: 0.2;
  border-right: 1px solid #ffffff;
  height: 25px;
  margin-left: 5px;
`;

export const TileControl = ({ tileSet, ...props }) => (
  <StyledButton variant="contained" {...props}>
    <img src={tileSet.thumbnail} alt="tile" />
    <Label>{tileSet.label}</Label>
    <Divider />
    <RightIcon />
    <RightIcon />
  </StyledButton>
);

TileControl.propTypes = {
  tileSet: PropTypes.shape(tileSetShape).isRequired,
};
