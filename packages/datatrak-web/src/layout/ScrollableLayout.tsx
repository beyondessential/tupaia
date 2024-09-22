/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { HEADER_HEIGHT, TITLE_BAR_HEIGHT } from '../constants';

export const HeaderLessFullHeightContainer = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT} - ${TITLE_BAR_HEIGHT});
  display: flex;
  flex-direction: column;
`;

export const ScrollableLayout = () => {
  return (
    <HeaderLessFullHeightContainer>
      <Outlet />
    </HeaderLessFullHeightContainer>
  );
};
