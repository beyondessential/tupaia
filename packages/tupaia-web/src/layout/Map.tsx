/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import { SidebarContext } from '../context';

const MapContainer = styled.div<{
  $rightOffset: number;
}>`
  height: 100vh;
  width: calc(100vw - ${p => p.$rightOffset}px);
  transition: width 0.5s ease;
  position: absolute; // allow the map to sit behind the map controls
  z-index: -1;
`;

export const Map = () => {
  const { isExpanded, expandedWidth, contractedWidth } = useContext(SidebarContext);

  const sidePanelWidth = isExpanded ? expandedWidth : contractedWidth;

  return <MapContainer $rightOffset={sidePanelWidth}>{/* <Map /> */}</MapContainer>;
};
