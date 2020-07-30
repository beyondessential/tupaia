/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Container, Main } from '../../components';

const Section = styled.section`
  background: white;
  border: 2px dashed black;
  height: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const SidebarPlaceholder = styled.aside`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: -85px;
  align-items: center;
  background: white;
  border-radius: 3px;
  border: 1px solid #dedee0;
  height: 600px;
`;

export const EventBasedTabView = () => (
  <Container>
    <Main>
      <Section>
        <Typography variant="h2" gutterBottom>
          Event Based View
        </Typography>
      </Section>
    </Main>
    <SidebarPlaceholder>
      <Typography variant="h2" gutterBottom>
        Sidebar
      </Typography>
      <Typography variant="body1" gutterBottom>
        Event Based Country View
      </Typography>
    </SidebarPlaceholder>
  </Container>
);
