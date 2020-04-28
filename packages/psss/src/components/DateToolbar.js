/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { CalendarToday } from '@material-ui/icons';
import styled from 'styled-components';
import { BaseToolbar } from './Toolbar';

const Week = styled(Typography)`
  margin-right: 1.5rem;
`;

const Date = styled(Typography)`
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  svg {
    margin-right: 0.5rem;
  }
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

/*
 * Date Toolbar
 */
export const DateToolbar = () => (
  <BaseToolbar>
    <FlexContainer>
      <Week variant="h5">Week 10</Week>
      <Date variant="h6">
        <CalendarToday /> Feb 25 2020 - Mar 1, 2020
      </Date>
    </FlexContainer>
  </BaseToolbar>
);
