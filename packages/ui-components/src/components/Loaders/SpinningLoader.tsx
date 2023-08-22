/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FlexCenter } from '../Layout';

const Container = styled(FlexCenter)`
  width: 100%;
  height: 100%;
  align-self: center;
`;

export const SpinningLoader = () => (
  <Container>
    <CircularProgress size={50} />
  </Container>
);
