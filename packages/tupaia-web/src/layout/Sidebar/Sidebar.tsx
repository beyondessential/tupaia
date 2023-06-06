/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import {
  MAX_SIDEBAR_EXPANDED_WIDTH,
  TRANSPARENT_BLACK,
  CONTROL_BAR_PADDING,
  CONTROL_BAR_WIDTH,
  MAP_CONTROLS_WIDTH,
} from '../../theme';
import { ExpandButton } from './ExpandButton';
import { SIDEBAR_ACTION_TYPES, SidebarContext, SidebarDispatchContext } from '../../context';

const MIN_DEFAULT_WIDTH = 350;
const MAX_DEFAULT_WIDTH = 500;
const DEFAULT_WIDTH_RATIO = 0.2;

const Panel = styled.div<{
  $width: number;
}>`
  display: flex;
  align-items: stretch;
  flex-direction: column;
  align-content: stretch;
  max-width: ${MAX_SIDEBAR_EXPANDED_WIDTH}px;
  position: relative;
  overflow: visible;
  background-color: ${TRANSPARENT_BLACK};
  pointer-events: auto;
  height: 100%;
  cursor: auto;
  transition: width 0.5s ease;
  width: ${({ $width }) => $width}px;
`;

export const Sidebar = () => {
  const { isExpanded, expandedWidth, contractedWidth } = useContext(SidebarContext);
  const dispatch = useContext(SidebarDispatchContext);

  // Update the sidebar widths when the window is resized
  const updateDimensions = () => {
    let dashboardDefaultWidth = window.innerWidth * DEFAULT_WIDTH_RATIO;
    dashboardDefaultWidth = Math.min(dashboardDefaultWidth, MAX_DEFAULT_WIDTH);
    dashboardDefaultWidth = Math.max(dashboardDefaultWidth, MIN_DEFAULT_WIDTH);

    let dashboardExpandedWidth =
      window.innerWidth - CONTROL_BAR_WIDTH - MAP_CONTROLS_WIDTH - CONTROL_BAR_PADDING * 2;
    dashboardExpandedWidth = Math.min(dashboardExpandedWidth, MAX_SIDEBAR_EXPANDED_WIDTH);

    dispatch({
      type: SIDEBAR_ACTION_TYPES.RESIZE,
      payload: {
        contractedWidth: dashboardDefaultWidth,
        expandedWidth: dashboardExpandedWidth,
      },
    });
  };

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  return (
    <Panel $width={isExpanded ? expandedWidth : contractedWidth}>
      <ExpandButton />
    </Panel>
  );
};
