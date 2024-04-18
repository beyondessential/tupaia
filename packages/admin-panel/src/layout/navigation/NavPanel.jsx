/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { NavLink as BaseNavLink } from 'react-router-dom';
import { List, ListItem as BaseListItem } from '@material-ui/core';
import { WHITE } from '../../theme/colors';
import { HomeLink } from './HomeLink';
import { UserProfileInfo } from './UserProfileInfo';

const Wrapper = styled.div`
  background-color: ${props => props.theme.palette.secondary.main};
  padding-inline: 0.625rem;
  padding-block: 1.5rem;
  display: flex;
  flex-direction: column;

  ${HomeLink} {
    width: 100%;
  }
  * {
    color: ${WHITE};
  }
`;

const Nav = styled.nav`
  margin-block-start: 1.4rem;
`;

const NavLink = styled(BaseNavLink)`
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  width: 100%;
  text-decoration: none;
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0.625rem;
  border: 1px solid transparent;
  .MuiSvgIcon-root {
    margin-inline-end: 0.8rem;
  }
  &.active {
    background-color: ${WHITE}33; // 33 is 20% opacity
  }
  &:hover,
  &:focus {
    border-color: ${WHITE};
  }
`;

const ListItem = styled(BaseListItem)`
  display: flex;
  align-items: center;
  padding: 0;
  margin-block-end: 0.5rem;
`;

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const NavPanel = ({ links, user }) => {
  return (
    <Wrapper>
      <HomeLink />
      <Container>
        {links.length && (
          <Nav>
            <List>
              {links.map(link => (
                <ListItem key={link.label} disableGutters>
                  <NavLink to={link.to}>
                    {link.icon}
                    {link.label}
                  </NavLink>
                </ListItem>
              ))}
            </List>
          </Nav>
        )}
        <UserProfileInfo user={user} />
      </Container>
    </Wrapper>
  );
};

NavPanel.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({})),
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
};

NavPanel.defaultProps = {
  links: [],
};
