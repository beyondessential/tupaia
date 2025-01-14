import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router';
import { Map } from '../../features';
import { MOBILE_BREAKPOINT } from '../../constants';

const Container = styled.div`
  display: none;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
  }
`;

/**
 * This is the layout Desktop map and dashboard. This contains the map and the sidebar, as well as any overlays that are not auth overlays (i.e. not needed in landing pages)
 */
export const DesktopLayout = () => {
  return (
    <Container>
      <Map />
      {/* Ensure the dashboard outlet is not rendered above the Map, otherwise the map will re-mount on route changes */}
      <Outlet />
    </Container>
  );
};
