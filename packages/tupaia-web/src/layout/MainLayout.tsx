import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router';
import { EnvBanner } from '@tupaia/ui-components';
import { TopBar } from './TopBar';
import { MOBILE_BREAKPOINT } from '../constants';
import { ModalRoutes } from '../ModalRoutes';

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
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    overflow-y: hidden;
  }
`;

export const MainLayout = () => {
  return (
    <>
      <ModalRoutes />
      <Container>
        <EnvBanner />
        <TopBar />
        <Outlet />
      </Container>
    </>
  );
};
