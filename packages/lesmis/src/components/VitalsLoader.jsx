import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import MuiBox from '@material-ui/core/Box';
import Skeleton from '@material-ui/lab/Skeleton';
import { EntityVitalsItem } from './EntityVitalsItem';

const Wrapper = styled.section`
  background: #fbfbfb;
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 10px;
  row-gap: 15px;
  padding-right: 1rem;
  padding-top: 0.6rem;
`;

export const VitalsLoader = () => (
  <Wrapper>
    <MuiContainer maxWidth="xl">
      <MuiBox display="flex" alignItems="flex-start" justifyContent="flex-start">
        <MuiBox pt={5}>
          <Skeleton width={220} height={24} />
          <LoadingGrid>
            <EntityVitalsItem isLoading />
            <EntityVitalsItem isLoading />
            <EntityVitalsItem isLoading />
            <EntityVitalsItem isLoading />
            <EntityVitalsItem isLoading />
            <EntityVitalsItem isLoading />
          </LoadingGrid>
        </MuiBox>
        <Skeleton width={400} height={350} variant="rect" />
      </MuiBox>
    </MuiContainer>
  </Wrapper>
);
