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

const SectionsArea = styled.div`
  margin-block-start: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow: hidden auto;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${WHITE}99; /* ~60% opacity */
  padding-inline: 0.5rem;
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
  overflow: hidden;
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

const NavListItem = ({ link, navPanelOpen }) => {
  const ItemWrapper = navPanelOpen
    ? React.Fragment
    : ({ children }) => <Tooltip title={link.label}>{children}</Tooltip>;
  return (
    <ListItem key={link.id} disableGutters>
      <ItemWrapper>
        <NavLink to={link.to}>
          {link.icon}
          {link.label}
        </NavLink>
      </ItemWrapper>
    </ListItem>
  );
};

NavListItem.propTypes = {
  link: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
  }).isRequired,
  navPanelOpen: PropTypes.bool.isRequired,
};

const NavSection = ({ section, isOpen }) => {
  const { label, items, headerContent } = section;
  if (items.length === 0 && !headerContent) return null;
  return (
    <Section>
      {isOpen && label && <SectionLabel>{label}</SectionLabel>}
      {headerContent}
      {items.length > 0 && (
        <List disablePadding>
          {items.map(item => (
            <NavListItem link={item} navPanelOpen={isOpen} key={item.id} />
          ))}
        </List>
      )}
    </Section>
  );
};

NavSection.propTypes = {
  section: PropTypes.shape({
    label: PropTypes.string,
    items: PropTypes.array.isRequired,
    headerContent: PropTypes.node,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export const NavPanel = ({ sections, logo, homeLink, profileLink, isOpen }) => {
  return (
    <Drawer variant="permanent" anchor="left" open={isOpen}>
      <Wrapper>
        <HeaderContainer>
          <HomeLink logo={logo} homeLink={homeLink} style={{ width: '100%' }} />
        </HeaderContainer>

        <Container>
          <SectionsArea>
            {sections.map(section => (
              <NavSection section={section} isOpen={isOpen} key={section.id} />
            ))}
          </SectionsArea>
          <UserProfileInfo profileLink={profileLink} isFullWidth={isOpen} />
        </Container>
      </Wrapper>
    </Drawer>
  );
};

NavPanel.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      items: PropTypes.array.isRequired,
      headerContent: PropTypes.node,
    }),
  ),
  logo: PropTypes.shape({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }),
  homeLink: PropTypes.string,
  profileLink: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }),
  isOpen: PropTypes.bool.isRequired,
};

NavPanel.defaultProps = {
  sections: [],
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
  profileLink: null,
};
