/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Sidebar, Map } from '.';

const Container = styled.div`
  display: none;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
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
      <Sidebar />
    </Container>
  );
};
