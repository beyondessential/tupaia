/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Provider } from 'react-redux';
import { SurveysPage } from '@tupaia/admin-panel/lib';
import { Container } from '@material-ui/core';
import * as COLORS from '../constants';
import { PageHeader } from '../components';
import { store } from '../store';

const Section = styled.section`
  display: flex;
  background: ${COLORS.GREY_F9};
  padding-top: 1.6rem;
  padding-bottom: 3rem;
  min-height: 70vh;

  .MuiDataGrid-root {
    background: white;
  }
`;

export const SurveysView = () => {
  const headerEl = React.useRef(null);

  const getHeaderEl = () => {
    return headerEl;
  };

  return (
    <Provider store={store}>
      <div>
        <PageHeader title="Surveys" breadcrumbs={[{ name: 'Surveys', url: '/surveys' }]} />
        <div ref={headerEl} />
        <Section>
          <Container maxWidth="lg">
            <h2>Surveys Table</h2>
            <SurveysPage getHeaderEl={getHeaderEl} isBESAdmin />
          </Container>
        </Section>
      </div>
    </Provider>
  );
};
