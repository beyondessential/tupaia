/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Container, Main } from '../../components';
import { ArchiveTable } from '../../containers';

export const ArchiveTabView = () => (
  <div style={{ position: 'relative' }}>
    <Container>
      <Main>
        <ArchiveTable />
      </Main>
    </Container>
  </div>
);
