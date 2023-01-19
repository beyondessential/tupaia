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

export const NavBar = ({ HomeButton, Profile, links, isTabActive, maxWidth }) => (
  <Wrapper>
    <MuiContainer maxWidth={maxWidth}>
      <Inner>
        <NavLinks>
          {HomeButton}
          {links.map(({ label, to, isActive, icon, id }) => (
            <StyledTab
              isActive={isActive || isTabActive}
              activeClassName="Mui-selected"
              component={NavLink}
              key={to}
              to={to}
              value={to}
              id={id ?? null}
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
  HomeButton: PropTypes.node.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      to: PropTypes.string,
      isActive: PropTypes.func,
      icon: PropTypes.node,
      id: PropTypes.string,
    }),
  ).isRequired,
  Profile: PropTypes.elementType.isRequired,
  isTabActive: PropTypes.func,
  maxWidth: PropTypes.string,
};

NavBar.defaultProps = {
  isTabActive: () => {},
  maxWidth: null,
};
