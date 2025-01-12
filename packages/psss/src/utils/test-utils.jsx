import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppProviders } from '../AppProviders';
import { store } from '../store/store';

const customRender = ui => render(<AppProviders store={store}>{ui}</AppProviders>);

export { customRender as render };
