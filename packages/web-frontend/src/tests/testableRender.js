/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { StylesProvider } from '@material-ui/styles';

const customRender = ui => {
  return render(<StylesProvider injectFirst>{ui}</StylesProvider>);
};

export { customRender as render };
