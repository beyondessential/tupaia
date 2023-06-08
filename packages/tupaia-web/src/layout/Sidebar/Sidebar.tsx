/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { TRANSPARENT_BLACK } from '../../constants';
import { ExpandButton } from './ExpandButton';

const MAX_SIDEBAR_EXPANDED_WIDTH = 1000;
const MAX_SIDEBAR_COLLAPSED_WIDTH = 350;

const Panel = styled.div<{
  $isExpanded: boolean;
}>`
  display: flex;
  align-items: stretch;
  flex-direction: column;
  align-content: stretch;
  position: relative;
  overflow: visible;
  background-color: ${TRANSPARENT_BLACK};
  pointer-events: auto;
  height: 100%;
  cursor: auto;
  transition: width 0.5s ease, max-width 0.5s ease;
  width: ${({ $isExpanded }) => ($isExpanded ? 45 : 30)}%;
  min-width: 335px;
  max-width: ${({ $isExpanded }) =>
    $isExpanded ? MAX_SIDEBAR_EXPANDED_WIDTH : MAX_SIDEBAR_COLLAPSED_WIDTH}px;
`;

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Panel $isExpanded={isExpanded}>
      <ExpandButton setIsExpanded={toggleExpanded} isExpanded={isExpanded} />
    </Panel>
  );
};
