/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { Breadcrumbs } from '../components';

const ToolbarWrapper = styled.section`
  padding-top: 1.1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Container = styled(MuiContainer)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const EntityView = () => {
  return (
    <>
      <ToolbarWrapper>
        <Container maxWidth={false}>
          <Breadcrumbs />
        </Container>
      </ToolbarWrapper>
    </>
  );
};
