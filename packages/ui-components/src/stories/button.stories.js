import React from 'react';
import { action } from '@storybook/addon-actions';
import { Button } from '../components/Button';

export default {
  title: 'Button',
};

export const Default = () => (
  <>
    <Button onClick={action('Default button clicked')}>Default</Button>
    <br />
    <br />
    <Button isSubmitting>Default</Button>
  </>
);

export const Secondary = () => (
  <>
    <Button color="secondary" onClick={action('Default button clicked')}>Secondary</Button>
    <br />
    <br />
    <Button color="secondary" onClick={action('Default button clicked')} isSubmitting>Secondary</Button>
  </>
);

export const Outlined = () => (
  <>
    <Button variant="outlined" onClick={action('Default button clicked')}>Outlined</Button>
    <br />
    <br />
    <Button variant="outlined" isSubmitting>Outlined</Button>
  </>
);
