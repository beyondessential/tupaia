/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { NAVBAR_HEIGHT } from '../constants';

const Wrapper = styled.div`
  position: relative;
  height: calc(100vh - ${NAVBAR_HEIGHT});
  z-index: -1;
`;

const CoverImage = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-size: cover;
  z-index: -1;
  background-image: url('images/laos-school-children.jpeg');
`;

const Main = styled.div`
  padding-top: 13%;
  left: 0;
  max-width: 525px;
`;

const Subtitle = styled(Typography)`
  //font-family: Poppins;
  color: white;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 27px;
  margin-bottom: 10px;
`;

const Title = styled(Typography)`
  //font-family: Poppins;
  color: white;
  font-style: normal;
  font-weight: 600;
  font-size: 28px;
  line-height: 42px;
`;

export const HomeView = () => (
  <Wrapper>
    <MuiContainer>
      <Main>
        <Subtitle variant="h2">Welcome to</Subtitle>
        <Title variant="h1">Lao PDR Education and Management Information System</Title>
      </Main>
    </MuiContainer>
    <CoverImage />
  </Wrapper>
);
