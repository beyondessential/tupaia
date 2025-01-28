import React from 'react';
import { useParams } from 'react-router-dom';
import { ComingSoon, Container, Main } from '../../components';
import { FakeEventBasedDataTable } from '../../containers';

export const EventBasedTabView = () => {
  const { countryCode } = useParams();

  return (
    <div style={{ position: 'relative' }}>
      <ComingSoon text="The Event-based page will allow you to see event based data." />
      <Container maxWidth="xl">
        <Main>
          <FakeEventBasedDataTable countryCode={countryCode} />
        </Main>
      </Container>
    </div>
  );
};
