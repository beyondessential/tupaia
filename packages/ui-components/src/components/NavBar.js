/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { LightTab } from './Tabs';

const Wrapper = styled.nav`
  position: relative;
  z-index: 1;
  background-color: ${props => props.theme.palette.primary.main};
`;

const borderColor = 'rgba(255, 255, 255, 0.2)';

const Inner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${borderColor};
`;

const NavLinks = styled.div`
  display: flex;
  justify-content: flex-start;

  img {
    margin-right: 3rem;
  }
`;

const StyledTab = styled(LightTab)`
  border-bottom: 3px solid ${props => props.theme.palette.primary.main};
  transition: border-bottom-color 0.3s ease;

  &.Mui-selected {
    border-bottom-color: white;
  }
`;

export const NavBar = ({ HomeButton, Profile, links, isTabActive }) => (
  <Wrapper>
    <MuiContainer>
      <Inner>
        <NavLinks>
          <HomeButton />
          {links.map(({ label, to, icon }) => (
            <StyledTab
              isActive={isTabActive}
              activeClassName="Mui-selected"
              component={NavLink}
              key={to}
              to={to}
              value={to}
            >
              {icon}
              {label}
            </StyledTab>
          ))}
        </NavLinks>
        <Profile />
      </Inner>
    </MuiContainer>
  </Wrapper>
);

NavBar.propTypes = {
  HomeButton: PropTypes.any.isRequired,
  links: PropTypes.any.isRequired,
  Profile: PropTypes.any.isRequired,
  isTabActive: PropTypes.func.isRequired,
};
