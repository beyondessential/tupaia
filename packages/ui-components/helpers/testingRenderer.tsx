import React, { ReactNode } from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppProviders } from './AppProviders';

const customRender = (ui: ReactNode) => {
  return render(<AppProviders>{ui}</AppProviders>);
};

export { customRender as render };
