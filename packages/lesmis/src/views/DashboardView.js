/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

const TemplateBody = styled.section`
  background: #e5e5e5;
  padding-top: 1rem;
  min-height: 50vh;
`;

export const DashboardView = () => (
  <TemplateBody>
    <MuiContainer>
      <Typography>Dashboard View</Typography>
    </MuiContainer>
  </TemplateBody>
);
