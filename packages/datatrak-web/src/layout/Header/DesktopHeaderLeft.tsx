/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '../../components';
import { DESKTOP_MEDIA_QUERY, HEADER_HEIGHT } from '../../constants';

const Logo = styled(Button)`
  height: ${HEADER_HEIGHT};
  padding: 0;
  background: transparent;
  display: none;
  &:hover {
    background: transparent;
  }
  .MuiButton-label {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0.8rem 0.5rem;
    img {
      max-height: 100%;
    }
  }
  ${DESKTOP_MEDIA_QUERY} {
    display: block;
  }
`;

export const DesktopHeaderLeft = ({ onClickLogo }) => {
  return (
    <Logo component={RouterLink} onClick={onClickLogo} to="/" title="Home">
      <img src="/datatrak-logo-black.svg" alt="Tupaia Datatrak logo" width="100%" height="100%" />
    </Logo>
  );
};
