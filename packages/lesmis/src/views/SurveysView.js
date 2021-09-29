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
import { store } from '../admin-panel';

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
        <div ref={headerEl} />
        <Section>
          <Container maxWidth="xl">
            <SurveysPage getHeaderEl={getHeaderEl} isBESAdmin />
          </Container>
        </Section>
      </div>
    </Provider>
  );
};
