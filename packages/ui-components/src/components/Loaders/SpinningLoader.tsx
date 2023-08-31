/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { CircularProgress, BoxProps } from '@material-ui/core';
import { FlexCenter } from '../Layout';

const Container = styled(FlexCenter)`
  width: 100%;
  height: 100%;
  align-self: center;
`;

export const SpinningLoader = (props: BoxProps) => (
  <Container {...props}>
    <CircularProgress size={50} />
  </Container>
);
