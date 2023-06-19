/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { MapLayout, Sidebar } from '.';

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
 * This is the layout for the project/* view. This contains the map and the sidebar, as well as any overlays that are not auth overlays (i.e. not needed in landing pages)
 */
export const DesktopLayout = () => {
  // Use these to fetch the project and any other entity info you might need
  // const { projectCode, entityCode, '*': dashboardCode } = useParams();

  return (
    <Container>
      <MapLayout />
      <Sidebar />
    </Container>
  );
};
