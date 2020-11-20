/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import MuiContainer from '@material-ui/core/Container';
import { ComingSoon, Container, Main } from '../../components';
import { ArchiveTable } from '../../containers';

export const ArchiveTabView = () => {
  const { countryCode } = useParams();

  return (
    <div style={{ position: 'relative' }}>
      <ComingSoon text="The Archive page will show archived Alerts and Outbreaks." />
      <MuiContainer style={{ position: 'relative ' }}>
        <Main>
          <ArchiveTable countryCode={countryCode} />
        </Main>
      </MuiContainer>
    </div>
  );
};
