/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TopProgressBar } from '../components/TopProgressBar';
import { render as r } from '@testing-library/react';
import { AppProviders } from '../AppProviders';

function render(children) {
  return r(children, { wrapper: AppProviders });
}

describe('Example test', () => {
  it('passes a stub test', () => {
    expect(1).toBe(1);
    render(<TopProgressBar currentSurveyQuestion={1} totalNumberOfSurveyQuestions={2} />);
  });
});
