/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import MuiBox from '@material-ui/core/Box';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import styled from 'styled-components';
import { SaveAlt } from '../src/components/Icons';
import {
  Button,
  LightPrimaryButton,
  TextButton,
  SmallButton,
  SuccessButton,
  WarningButton,
  LightOutlinedButton,
  ErrorOutlinedButton,
  GreyOutlinedButton,
  FavouriteButton,
  FlexColumn as BaseFlexColumn,
} from '../src/components';
import * as COLORS from './story-utils/theme/colors';

export default {
  title: 'Button',
  component: Button,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

const FlexColumn = styled(BaseFlexColumn)`
  width: 20px;
`;

export const primary = () => (
  <Container>
    <Button>Button</Button>
  </Container>
);

export const lightPrimary = () => (
  <Container>
    <LightPrimaryButton startIcon={<CheckCircleIcon />}>Confirmed</LightPrimaryButton>
  </Container>
);

export const secondary = () => (
  <Container>
    <Button color="secondary">Secondary</Button>
  </Container>
);

export const warning = () => (
  <Container>
    <WarningButton>Warning</WarningButton>
  </Container>
);

export const success = () => (
  <Container>
    <SuccessButton>Success</SuccessButton>
  </Container>
);

export const outlined = () => (
  <Container>
    <Button variant="outlined">Outlined</Button>
  </Container>
);

export const errorOutlined = () => (
  <Container>
    <ErrorOutlinedButton>Outlined</ErrorOutlinedButton>
  </Container>
);

export const lightOutlined = () => (
  <Container bgcolor={COLORS.BLUE}>
    <LightOutlinedButton startIcon={<SaveAlt />}>Export Data</LightOutlinedButton>
  </Container>
);

export const greyOutlined = () => (
  <Container bgcolor={COLORS.LIGHTGREY}>
    <GreyOutlinedButton>Edit</GreyOutlinedButton>
    <GreyOutlinedButton disabled>Disabled</GreyOutlinedButton>
  </Container>
);

export const large = () => (
  <Container>
    <Button fullWidth>Large</Button>
  </Container>
);

export const medium = () => (
  <Container>
    <Button>Medium</Button>
  </Container>
);

export const small = () => (
  <Container>
    <SmallButton>Small</SmallButton>
  </Container>
);

export const text = () => (
  <Container>
    <TextButton>Text button</TextButton>
  </Container>
);

export const loading = () => (
  <Container>
    <Button isLoading loadingText="Loading">
      Default
    </Button>
  </Container>
);

export const favourite = () => {
  const [state, setState] = useState(false);

  return (
    <FlexColumn>
      <FavouriteButton
        isFavourite={state}
        onChange={() => {
          setState(!state);
        }}
      />
    </FlexColumn>
  );
};
