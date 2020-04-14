/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  Button,
  TextButton,
  SmallButton,
  SuccessButton,
  WarningButton,
  LightOutlinedButton,
  ProfileButton,
} from '../components/Button';
import MuiBox from '@material-ui/core/Box';
import * as COLORS from '../theme/colors';
import { SystemUpdateAlt } from '@material-ui/icons';
import Avatar from '@material-ui/core/Avatar';
import styled from 'styled-components';

export default {
  title: 'Button',
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

export const primary = () => (
  <Container>
    <Button onClick={action('Primary button clicked')}>Button</Button>
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

export const lightOutlined = () => (
  <Container bgcolor={COLORS.BLUE}>
    <LightOutlinedButton endIcon={<SystemUpdateAlt />}>Outlined</LightOutlinedButton>
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
    <Button isSubmitting>Default</Button>
  </Container>
);

export const profile = () => (
  <Container bgcolor={COLORS.BLUE}>
    <ProfileButton startIcon={<Avatar>T</Avatar>}>Tom</ProfileButton>
  </Container>
);
