/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SystemUpdateAlt } from '@material-ui/icons';
import { LightOutlinedButton } from '@tupaia/ui-components';
import * as COLORS from '../theme/colors';

const HeaderMain = styled.header`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
`;

const HeaderInner = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 55px 0 65px;
`;

export const Header = ({ title }) => {
  return (
    <HeaderMain>
      <MuiContainer maxWidth="lg">
        <HeaderInner>
          <div>
            <Typography variant="h1" component="h1">
              {title}
            </Typography>
          </div>
          <LightOutlinedButton startIcon={<SystemUpdateAlt />}>Export Data</LightOutlinedButton>
        </HeaderInner>
      </MuiContainer>
    </HeaderMain>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
};
