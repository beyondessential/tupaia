/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { ComingSoon, Container, Main } from '../../components';
import { FakeEventBasedDataTable } from '../../containers';

export const EventBasedTabView = () => {
  const { countryCode } = useParams();

  return (
    <div style={{ position: 'relative' }}>
      <ComingSoon text="The Event-based page will allow you to see event based data." />
      <Container>
        <Main>
          <FakeEventBasedDataTable countryCode={countryCode} />
        </Main>
      </Container>
    </div>
  );
};
