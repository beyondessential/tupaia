/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ZoomIn from '@material-ui/icons/Add';
import ZoomOut from '@material-ui/icons/Remove';
import Button from '@material-ui/core/Button';
import { OFF_WHITE, TRANS_BLACK_LESS } from '../../../styles';

const ZoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: auto;
`;

const StyledButton = styled(Button)`
  max-width: 30px;
  min-width: 30px;
  color: ${OFF_WHITE};
  background: ${TRANS_BLACK_LESS};
  box-shadow: none;
`;

const ZoomInButton = styled(StyledButton)`
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
`;

const ZoomOutButton = styled(StyledButton)`
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top: none;
`;

export const ZoomControl = ({ onZoomInClick, onZoomOutClick }) => (
  <ZoomContainer>
    <ZoomInButton variant="contained" onClick={onZoomInClick}>
      <ZoomIn />
    </ZoomInButton>
    <ZoomOutButton variant="contained" onClick={onZoomOutClick}>
      <ZoomOut />
    </ZoomOutButton>
  </ZoomContainer>
);

ZoomControl.propTypes = {
  onZoomInClick: PropTypes.func.isRequired,
  onZoomOutClick: PropTypes.func.isRequired,
};
