/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { EnvBanner } from '@tupaia/ui-components';
import { TopBar } from './TopBar';
import { DEFAULT_PROJECT_ENTITY, DEFAULT_URL, MOBILE_BREAKPOINT, MODAL_ROUTES } from '../constants';

/**
 * This is the layout for the entire app, which contains the top bar and the main content. This is used to wrap the entire app content
 */
const Container = styled.div`
  position: fixed;
  flex-direction: column;
  flex-wrap: nowrap;
  width: 100%;
  display: flex;
  align-items: stretch;
  align-content: stretch;
  overflow-y: auto; // allows scroll at mobile size
  height: 100%;
  svg.recharts-surface {
    overflow: visible;
  }
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    overflow-y: hidden;
  }
`;

// on mount, if the url is just the explore page, redirect to the projects tab. This only happens on first mount of this view. This needs to go here, not in ProjectPage on the off chance a custom landing page directs to the explore project
const useShowProjectsModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (
      (location.pathname === DEFAULT_URL || location.pathname === DEFAULT_PROJECT_ENTITY) &&
      !location.hash
    ) {
      navigate({
        ...location,
        hash: MODAL_ROUTES.PROJECTS,
      });
    }
  }, []);
};
export const MainLayout = () => {
  useShowProjectsModal();
  return (
    <Container>
      <EnvBanner />
      <TopBar />
      <Outlet />
    </Container>
  );
};
