/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 30px;
  background: white;
`;

const StyledImg = styled.img`
  height: 30px;
  width: auto;
`;

export const Header = () => {
  return (
    <Container>
      <StyledImg src="/tupaia-logo-black.svg" alt="tupaia-logo" />
      <IconButton>
        <MenuIcon />
      </IconButton>
    </Container>
  );
};
