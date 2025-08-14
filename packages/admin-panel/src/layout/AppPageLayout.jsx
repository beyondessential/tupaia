import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { labelToId } from '../utilities';
import { NavPanel } from './navigation';
import { CaretLeftIcon } from '../icons';
import { NAV_PANEL_CLOSED_WIDTH, NAV_PANEL_OPEN_WIDTH } from './navigation/NavPanel';

const PageWrapper = styled.div`
  display: flex;
  overflow: hidden;
  flex: 1;
`;

const Main = styled.main`
  overflow-x: auto;
  // This is so that we can make the PageBody component fill the whole remaining height of the screen
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
`;

const ArrowButton = styled(IconButton)`
  position: absolute;
  top: 1.8rem;
  right: ${props => (props.$navOpen ? '0.2rem' : '-1rem')};
  padding-block: 0.5rem;
  padding-inline: ${props =>
    props.$navOpen
      ? '0.5rem 0.55rem'
      : '0.55rem 0.5rem'}; // make up for the visual effect of the icon point
  background-color: ${props => props.theme.palette.secondary.main};
  color: ${props => props.theme.palette.common.white};
  z-index: 1201; // above the drawer
  transition: right 0.2s ease, transform 0.2s ease;
  .MuiSvgIcon-root {
    font-size: 1rem;
    transform: ${props => (props.$navOpen ? 'rotate(0)' : 'rotate(180deg)')};
  }
  &:hover,
  &:focus-visible {
    background-color: ${props => props.theme.palette.secondary.light};
  }
`;

const NavWrapper = styled.div`
  position: relative;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  width: ${props =>
    props.$navOpen
      ? NAV_PANEL_OPEN_WIDTH
      : NAV_PANEL_CLOSED_WIDTH}; // this is set so that the button can be positioned correctly
`;

export const AppPageLayout = ({ routes, logo, homeLink, profileLink, basePath }) => {
  const [navOpen, setNavOpen] = useState(true);
  const toggleOpen = () => {
    setNavOpen(!navOpen);
  };
  return (
    <PageWrapper>
      <NavWrapper $navOpen={navOpen}>
        <NavPanel
          links={routes.map(route => ({ ...route, id: `app-tab-${labelToId(route.label)}` }))}
          profileLink={profileLink}
          logo={logo}
          homeLink={homeLink}
          basePath={basePath}
          isOpen={navOpen}
          setOpen={setNavOpen}
        />
        <ArrowButton onClick={toggleOpen} $navOpen={navOpen} aria-label="Toggle navigation panel">
          <CaretLeftIcon />
        </ArrowButton>
      </NavWrapper>
      <Main>
        <Outlet />
      </Main>
    </PageWrapper>
  );
};

AppPageLayout.propTypes = {
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }),
  ).isRequired,
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
};

AppPageLayout.defaultProps = {
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
  profileLink: null,
  basePath: '',
};
