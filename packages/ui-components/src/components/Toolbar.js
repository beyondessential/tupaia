/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import { PhotoAlbum, CalendarToday } from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import * as COLORS from '../theme/colors';
import { LightTab, LightTabs } from './Tabs';

const ToolbarOuter = styled.div`
  display: flex;
  align-items: center;
  height: 65px;
  background-color: ${COLORS.DARK_BLUE};
  color: ${COLORS.WHITE};
`;

const BaseToolbar = ({ children, ...props }) => (
  <ToolbarOuter {...props}>
    <Container maxWidth="lg">{children}</Container>
  </ToolbarOuter>
);

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

/*
 * Tabs Toolbar
 */

const TabsOuter = styled(BaseToolbar)`
  align-items: flex-end;
  text-transform: none !important;
`;

const ToolbarTab = styled(LightTab)`
  text-transform: none !important;
  font-size: 18px;
  line-height: 21px;
  padding-bottom: 21px;
`;

export const TabsToolbar = () => (
  <TabsOuter>
    <LightTabs>
      <ToolbarTab>
        <CalendarToday /> Weekly Case Data
      </ToolbarTab>
      <ToolbarTab>
        <PhotoAlbum /> Event-based Data
      </ToolbarTab>
    </LightTabs>
  </TabsOuter>
);
