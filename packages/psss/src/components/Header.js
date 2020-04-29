/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import * as COLORS from '../theme/colors';

const HeaderMain = styled.header`
  background-color: ${props => props.theme.palette.primary.main};
  color: ${COLORS.WHITE};
`;

const HeaderInner = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3.5rem 0 4rem;
`;

export const Header = ({ title }) => {
  return (
    <HeaderMain>
      <MuiContainer maxWidth="lg">
        <HeaderInner>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
        </HeaderInner>
      </MuiContainer>
    </HeaderMain>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
};
