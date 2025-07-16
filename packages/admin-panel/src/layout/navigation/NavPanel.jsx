import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { NavLink as BaseNavLink } from 'react-router-dom';
import { List, ListItem as BaseListItem, Drawer as BaseDrawer } from '@material-ui/core';
import { Tooltip } from '@tupaia/ui-components';
import { WHITE } from '../../theme/colors';
import { HomeLink } from './HomeLink';
import { UserProfileInfo } from './UserProfileInfo';

export const NAV_PANEL_OPEN_WIDTH = '13rem';
export const NAV_PANEL_CLOSED_WIDTH = '4rem';

const Wrapper = styled.div`
  background-color: ${props => props.theme.palette.secondary.main};
  padding-inline: 0.625rem;
  padding-block: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;

  * {
    color: ${WHITE};
  }
`;

const Nav = styled.nav`
  margin-block-start: 1.4rem;
  overflow: hidden;
`;

const NavLink = styled(BaseNavLink)`
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  width: 100%;
  height: 2.5rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0.625rem;
  border: 1px solid transparent;
  white-space: nowrap;
  .MuiSvgIcon-root {
    margin-inline-end: 0.8rem;
    font-size: 1.2rem;
  }
  &.active {
    background-color: ${WHITE}33; // 33 is 20% opacity
  }
  &:hover {
    background-color: ${WHITE}18; //  18 is 10% opacity
  }
  &:focus,
  &:focus-visible {
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

const Drawer = styled(BaseDrawer)`
  .MuiDrawer-paper {
    width: ${props => (props.open ? NAV_PANEL_OPEN_WIDTH : NAV_PANEL_CLOSED_WIDTH)};
    transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    position: absolute;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  a {
    overflow: hidden;
  }
  img {
    width: 7rem;
    max-width: unset;
  }
`;

const NavListItem = ({ link, basePath, navPanelOpen }) => {
  const ItemWrapper = navPanelOpen
    ? React.Fragment
    : ({ children }) => <Tooltip title={link.label}>{children}</Tooltip>;
  return (
    <ListItem key={link.label} disableGutters>
      <ItemWrapper>
        <NavLink to={`${basePath}${link.path}`}>
          {link.icon}
          {link.label}
        </NavLink>
      </ItemWrapper>
    </ListItem>
  );
};

NavListItem.propTypes = {
  link: PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
  }).isRequired,
  basePath: PropTypes.string.isRequired,
  navPanelOpen: PropTypes.bool.isRequired,
};

export const NavPanel = ({ links, logo, homeLink, profileLink, basePath, isOpen }) => {
  return (
    <Drawer variant="permanent" anchor="left" open={isOpen}>
      <Wrapper>
        <HeaderContainer>
          <HomeLink logo={logo} homeLink={homeLink} style={{ width: '100%' }} />
        </HeaderContainer>

        <Container>
          {links.length > 0 && (
            <Nav>
              <List>
                {links.map(link => (
                  <NavListItem
                    link={link}
                    basePath={basePath}
                    navPanelOpen={isOpen}
                    key={link.id}
                  />
                ))}
              </List>
            </Nav>
          )}
          <UserProfileInfo profileLink={profileLink} isFullWidth={isOpen} />
        </Container>
      </Wrapper>
    </Drawer>
  );
};

NavPanel.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({})),
  logo: PropTypes.shape({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }),
  homeLink: PropTypes.string,
  profileLink: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }),
  basePath: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
};

NavPanel.defaultProps = {
  links: [],
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
  profileLink: null,
  basePath: '',
};
