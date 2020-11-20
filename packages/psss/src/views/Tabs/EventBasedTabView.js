/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Main, ComingSoon } from '../../components';
import { AlertsTable } from '../../containers/Tables';

export const EventBasedTabView = () => {
  const { countryCode } = useParams();

  return (
    <Container>
      <ComingSoon text="The Event-based page will allow you to see event based data." />
      <Main>
        <AlertsTable handlePanelOpen={() => {}} countryCode={countryCode} />
      </Main>
    </Container>
  );
};
