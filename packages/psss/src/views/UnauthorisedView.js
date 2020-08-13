/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { SmallAlert } from '@tupaia/ui-components';
import { Container, Header, HeaderTitle, Main } from '../components';

const StyledAlert = styled(SmallAlert)`
  margin-top: 1.5rem;
`;

export const UnAuthorisedView = () => (
  <>
    <Header Title={<HeaderTitle title="UnAuthorised" />} />
    <Container>
      <Main>
        <StyledAlert severity="error" variant="standard">
          You do not have permission to view this page. If you would like to request access please
          contact a Tupaia administrator at https://info.tupaia.org/contact
        </StyledAlert>
      </Main>
    </Container>
  </>
);
