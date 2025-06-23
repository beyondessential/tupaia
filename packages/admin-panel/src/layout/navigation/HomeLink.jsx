import React from 'react';
import PropTypes from 'prop-types';
import { Link as BaseLink } from 'react-router-dom';
import styled from 'styled-components';
import { WHITE } from '../../theme/colors';

const Link = styled(BaseLink)`
  padding-inline: 0.6rem;
  padding-block: 0.2rem;
  display: block;
  border-radius: 4px;
  border: 1px solid transparent;
  img {
    display: block;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
  }
  &:focus,
  &:focus-visible {
    border-color: ${WHITE};
  }
`;

export const HomeLink = ({ logo, homeLink, disableHomeLink }) => {
  return (
    <Link to={homeLink} component={disableHomeLink ? 'div' : undefined}>
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
  disableHomeLink: PropTypes.bool,
};

HomeLink.defaultProps = {
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
  disableHomeLink: false,
};
