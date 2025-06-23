import React, { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';
import { CircularProgress } from '@material-ui/core';
import { FlexCenter } from '../Layout';

const Container = styled(FlexCenter)`
  width: 100%;
  height: 100%;
  align-self: center;
`;

interface SpinningLoaderProps extends ComponentPropsWithoutRef<typeof Container> {
  spinnerSize?: number | string;
}

export const SpinningLoader = (props: SpinningLoaderProps) => {
  const { spinnerSize = 50, ...restOfProps } = props;
  return (
    <Container {...restOfProps}>
      <CircularProgress size={spinnerSize} title="Loading" />
    </Container>
  );
};
