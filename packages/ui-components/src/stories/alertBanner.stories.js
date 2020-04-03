import React from 'react';
import { AlertBanner } from '../components/AlertBanner';

export default {
  title: 'Alert',
};

export const Default = () => (
  <AlertBanner>ILI Above Threhold. Please review and verify data.</AlertBanner>
);