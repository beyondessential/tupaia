/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import MuiBox from '@material-ui/core/Box';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LightTabs, LightTab } from './Tabs';

const Wrapper = styled.nav`
  background-color: ${props => props.theme.palette.primary.main};
`;

const borderColor = 'rgba(255, 255, 255, 0.2)';

const Inner = styled(MuiBox)`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${borderColor};

  .MuiTabs-root {
    margin-bottom: -1px; // This is needed to align the indicator with the border
  }
`;

const NavLinks = styled(MuiBox)`
  display: flex;
  justify-content: flex-start;

  img {
    margin-right: 3rem;
  }
`;

const Link = props => <LightTab {...props} component={RouterLink} />;

Link.propTypes = {
  to: PropTypes.string.isRequired,
};

export const NavBar = ({ HomeButton, Profile, links }) => {
  const location = useLocation();
  const [value, setValue] = useState(false);

  useEffect(() => {
    const newValue = links.some(link => link.to === location.pathname) ? location.pathname : false;
    setValue(newValue);
  }, [location]);

  return (
    <Wrapper>
      <MuiContainer>
        <Inner>
          <NavLinks>
            <HomeButton />
            <LightTabs value={value}>
              {links.map(({ label, to, icon }) => (
                <Link key={to} to={to} value={to}>
                  {icon}
                  {label}
                </Link>
              ))}
            </LightTabs>
          </NavLinks>
          <Profile />
        </Inner>
      </MuiContainer>
    </Wrapper>
  );
};

NavBar.propTypes = {
  HomeButton: PropTypes.any.isRequired,
  links: PropTypes.any.isRequired,
  Profile: PropTypes.any.isRequired,
};
