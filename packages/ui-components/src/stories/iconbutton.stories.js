import React from 'react';
import { PlusIconButton, MinusIconButton, AutoRenewIconButton } from '../components/IconButton';

export default {
  title: 'IconButton',
  component: Plus,
};

export const Plus = () => <PlusIconButton />;
export const Minus = () => <MinusIconButton />;
export const AutoRenew = () => <AutoRenewIconButton />;
