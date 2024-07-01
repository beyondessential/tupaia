/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { CircularProgress, BoxProps, Typography } from '@material-ui/core';
import { FlexCenter } from '../Layout';

const Container = styled(FlexCenter)`
  width: 100%;
  height: 100%;
  align-self: center;
  flex-direction: column;
  p {
    margin-block-start: 2rem;
  }
`;

interface SpinningLoaderProps extends BoxProps {
  spinnerSize?: number | string;
  text?: string;
}

export const SpinningLoader = (props: SpinningLoaderProps) => {
  const { spinnerSize = 50, text, ...restOfProps } = props;
  return (
    <Container {...restOfProps}>
      <CircularProgress size={spinnerSize} title="Loading" />
      {text && <Typography>{text}</Typography>}
    </Container>
  );
};
