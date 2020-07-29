/**
 * Tupaia Admin
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';

const HeaderMain = styled.header`
  background-color: ${props => props.theme.palette.primary.main};
  color: white;
`;

const HeaderInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 190px;
  padding-bottom: 1.25rem;
`;

export const Header = ({ children }) => (
  <HeaderMain>
    <MuiContainer maxWidth="lg">
      <HeaderInner>{children}</HeaderInner>
    </MuiContainer>
  </HeaderMain>
);

Header.propTypes = {
  children: PropTypes.node,
};

Header.defaultProps = {
  children: null,
};

export const Title = ({ children }) => <Typography variant="h1">{children}</Typography>;

Title.propTypes = {
  children: PropTypes.node,
};

Title.defaultProps = {
  children: null,
};

const HeaderButtonContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 20px;
`;

export const HeaderButtons = ({ children }) => (
  <HeaderButtonContainer>{children}</HeaderButtonContainer>
);

HeaderButtons.propTypes = {
  children: PropTypes.node,
};

HeaderButtons.defaultProps = {
  children: null,
};

const MinHeightContainer = styled(MuiContainer)`
  min-height: 400px;
`;

export const Body = ({ children, className }) => (
  <MinHeightContainer className={className} maxWidth="lg">
    {children}
  </MinHeightContainer>
);

Body.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Body.defaultProps = {
  children: null,
  className: '',
};
