/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { TRANSPARENT_BLACK } from '../../constants';
import { ExpandButton } from './ExpandButton';

const MAX_SIDEBAR_EXPANDED_WIDTH = 1000;
const MAX_SIDEBAR_COLLAPSED_WIDTH = 350;

const Panel = styled.div<{
  $isExpanded: boolean;
}>`
  position: relative;
  background-color: ${TRANSPARENT_BLACK};
  transition: width 0.5s ease, max-width 0.5s ease;
  width: ${({ $isExpanded }) => ($isExpanded ? 55 : 30)}%;
  min-width: 335px;
  max-width: ${({ $isExpanded }) =>
    $isExpanded ? MAX_SIDEBAR_EXPANDED_WIDTH : MAX_SIDEBAR_COLLAPSED_WIDTH}px;
  overflow: visible;
`;

const ScrollBody = styled.div`
  position: relative;
  height: 100%;
  overflow: auto;
`;

const Breadcrumbs = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  background: #efefef;
  height: 30px;
`;

const Image = styled.div`
  background: #62698d;
  width: 100%;
  height: 200px;
`;

const Button = styled.div`
  background: #efefef;
  width: 100%;
  height: 300px;
`;

const Title = styled(Typography)`
  position: sticky;
  top: 0;
  color: white;
  padding: 1rem;
  background-color: ${TRANSPARENT_BLACK};
  z-index: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Dropdown = styled.div`
  background: #4a4b55;
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
`;

const ChartsContainer = styled.div<{
  $isExpanded: boolean;
}>`
  display: grid;
  background-color: #4a4b55;
  grid-template-columns: repeat(auto-fill, minmax(300px, auto));
  column-gap: 0.5rem;
  row-gap: 0.5rem;

  padding: ${({ $isExpanded }) => ($isExpanded ? '0 0.5rem 0.5rem' : '0 0 0.5rem 0')};
`;

const Chart = styled.div`
  position: relative;
  background: #272832;
  height: 200px;
`;

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Panel $isExpanded={isExpanded}>
      <ExpandButton setIsExpanded={toggleExpanded} isExpanded={isExpanded} />
      <ScrollBody>
        <Breadcrumbs />
        <Image />
        <Title variant="h5">Northern</Title>
        <Dropdown>General</Dropdown>
        <ChartsContainer $isExpanded={isExpanded}>
          <Chart />
          <Chart />
          <Chart />
          <Chart />
          <Chart />
          <Chart />
          <Chart />
          <Chart />
          <Chart />
          <Chart />
        </ChartsContainer>
      </ScrollBody>
    </Panel>
  );
};
