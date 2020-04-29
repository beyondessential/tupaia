/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: lightgray;
  border: 2px dashed black;
  height: 800px;
  width: 100%;
`;

export const SideBar = () => {
  return (
    <Section>
      <Typography variant="h2" gutterBottom>
        SideBar
      </Typography>
    </Section>
  );
};
