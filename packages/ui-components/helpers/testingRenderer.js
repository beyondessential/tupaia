/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppProviders } from './AppProviders';

const customRender = ui => {
  return render(<AppProviders>{ui}</AppProviders>);
};

export { customRender as render };
