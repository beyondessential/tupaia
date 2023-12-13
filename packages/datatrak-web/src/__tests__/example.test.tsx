/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TopProgressBar } from '../components';
import { renderComponent } from './helpers/render.tsx';

describe('Example test', () => {
  it('passes a stub test', () => {
    expect(1).toBe(1);
  });

  it('renders a basic component', () => {
    renderComponent(<TopProgressBar currentSurveyQuestion={1} totalNumberOfSurveyQuestions={2} />);
  });
});
