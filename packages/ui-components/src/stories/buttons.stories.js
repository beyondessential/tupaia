import React from 'react';
import { action } from '@storybook/addon-actions';
import { Button, GradientButton } from '../components/Button';

export default {
  title: 'Button',
};

export const Default = () => (
  <Button onClick={action('Default button clicked')} variant="contained">
    Default
  </Button>
);

export const Primary = () => (
  <Button color="primary" onClick={action('Primary button clicked')} variant="contained">
    Primary
  </Button>
);

export const Secondary = () => (
  <Button color="secondary" onClick={action('Secondary button clicked')} variant="contained">
    Secondary
  </Button>
);

export const Loading = () => (
  <Button isSubmitting={true} onClick={action('Gradient button clicked')}>
    Default
  </Button>
);

export const Gradient = () => (
  <GradientButton onClick={action('Gradient button clicked')}>
    Gradient
  </GradientButton>
);

export const GradientLoading = () => (
  <GradientButton isSubmitting={true} onClick={action('Gradient button clicked')}>
    Gradient
  </GradientButton>
);

export const Combined = () => (
  <>
    <GradientButton onClick={action('Gradient button clicked')}>
      Gradient
    </GradientButton>
    <br/>
    <br/>
    <GradientButton isSubmitting={true} onClick={action('Gradient button clicked')}>
      Gradient
    </GradientButton>
  </>
);