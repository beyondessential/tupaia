import React from 'react';
import { action } from '@storybook/addon-actions';
import { TextField, CheckboxField } from '../components/Fields';

export default {
  title: 'Fields',
};

export const Text = () => (
  <TextField onChanage={action('Input changed')} />
);

export const Checkbox = () => (
  <CheckboxField />
);
