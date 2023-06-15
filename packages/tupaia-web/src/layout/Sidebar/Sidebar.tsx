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
  width: ${({ $isExpanded }) => ($isExpanded ? 45 : 30)}%;
  min-width: 335px;
  max-width: ${({ $isExpanded }) =>
    $isExpanded ? MAX_SIDEBAR_EXPANDED_WIDTH : MAX_SIDEBAR_COLLAPSED_WIDTH}px;
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
  color: white;
  margin: 1rem;
`;

const Dropdown = styled.div`
  background: #4a4b55;
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
`;

const ChartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #4a4b55;
`;

const Chart = styled.div`
  background: #272832;
  width: 100%;
  height: 220px;
  margin-bottom: 0.5rem;
`;

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Panel $isExpanded={isExpanded}>
      <ExpandButton setIsExpanded={toggleExpanded} isExpanded={isExpanded} />
      <Breadcrumbs />
      <Image />
      <Title variant="h5">Northern</Title>
      <Dropdown>General</Dropdown>
      <ChartsContainer>
        <Chart />
        <Chart />
        <Chart />
        <Chart />
        <Chart />
      </ChartsContainer>
    </Panel>
  );
};
