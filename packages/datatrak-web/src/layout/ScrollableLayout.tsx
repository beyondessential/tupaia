/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { HEADER_HEIGHT, SURVEY_TOOLBAR_HEIGHT } from '../constants';

const Container = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT} - ${SURVEY_TOOLBAR_HEIGHT});
  display: flex;
  flex-direction: column;
`;

export const ScrollableLayout = () => {
  return (
    <Container>
      <Outlet />
    </Container>
  );
};
