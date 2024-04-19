/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { HomeLink, UserLink } from '../../layout';

const Wrapper = styled.div`
  background-color: ${props => props.theme.palette.secondary.main};
  padding-block: 0.3rem;
  padding-inline: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  ${UserLink} {
    font-size: 0.875rem;
  }
`;

export const NavPanel = ({ logo, homeLink }) => {
  return (
    <Wrapper>
      <HomeLink logo={logo} homeLink={homeLink} />
      <UserLink to="/logout">Log out</UserLink>
    </Wrapper>
  );
};

NavPanel.propTypes = {
  logo: PropTypes.shape({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }),
  homeLink: PropTypes.string,
};

NavPanel.defaultProps = {
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
};
