/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Link as BaseLink } from 'react-router-dom';
import styled from 'styled-components';
import { WHITE } from '../../theme/colors';

const Link = styled(BaseLink)`
  padding-inline: 0.625rem;
  padding-block: 0.625rem;
  height: 4rem;
  display: block;
  border-radius: 4px;
  border: 1px solid transparent;
  img {
    display: block;
    height: 100%;
    max-height: 100%;
  }
  &:focus,
  &:focus-visible {
    border-color: ${WHITE};
  }
`;

export const HomeLink = ({ logo, homeLink }) => {
  return (
    <Link to={homeLink}>
      <img src={logo?.url} alt={logo?.alt || 'Logo'} />
    </Link>
  );
};

HomeLink.propTypes = {
  logo: PropTypes.shape({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }),
  homeLink: PropTypes.string,
};

HomeLink.defaultProps = {
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
};
