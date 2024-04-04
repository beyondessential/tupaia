/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { NavLink as BaseNavLink } from 'react-router-dom';

const NavBar = styled.nav`
  margin-block: 1.43rem;
  margin-inline-start: 1.2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(auto, 1fr));
`;

const NavLink = styled(BaseNavLink)`
  line-height: 1.5;
  text-decoration: none;
  padding-inline: 1.43rem;
  padding-block: 0.43rem;
  color: ${props => props.theme.palette.text.secondary};
  &.active {
    font-weight: ${props => props.theme.typography.fontWeightMedium};
    color: ${props => props.theme.palette.text.primary};
    border-bottom: 4px solid ${props => props.theme.palette.secondary.main};
  }
  &:not(:last-child) {
    border-right: 1px solid ${props => props.theme.palette.text.tertiary};
  }
  &:hover {
    color: ${props => props.theme.palette.text.primary};
    font-weight: ${props => props.theme.typography.fontWeightMedium};
  }
`;

export const SecondaryNavbar = ({ links: linkInput, baseRoute }) => {
  const links = linkInput.map(link => ({
    ...link,
    target: link.exact ? link.to : `${baseRoute}${link.to}`,
  }));
  return (
    <NavBar>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.target}
          isActive={(match, location) => {
            if (!match) {
              return false;
            }
            return match.url === location.pathname;
          }}
        >
          {link.label}
        </NavLink>
      ))}
    </NavBar>
  );
};

SecondaryNavbar.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }),
  ).isRequired,
  baseRoute: PropTypes.string.isRequired,
};
