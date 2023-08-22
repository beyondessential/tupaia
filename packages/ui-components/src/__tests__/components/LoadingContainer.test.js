/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { render } from '../../../helpers/testingRenderer';
import { LoadingContainer } from '../../components/Loaders/LoadingContainer';

const loadingMessage = 'Loading please wait...';
const content = 'Loaded Content';

describe('loading container', () => {
  it('renders loader', () => {
    const isLoading = true;

    render(
      <LoadingContainer heading={loadingMessage} isLoading={isLoading}>
        <div>{content}</div>
      </LoadingContainer>,
    );
    expect(screen.getByText(loadingMessage)).toBeInTheDocument();
  });

  it('displays loaded content', () => {
    const isLoading = false;

    render(
      <LoadingContainer heading={loadingMessage} isLoading={isLoading}>
        <div>{content}</div>
      </LoadingContainer>,
    );

    expect(screen.getByText(content)).toBeInTheDocument();
    expect(screen.queryByText(loadingMessage)).not.toBeInTheDocument();
  });
});
