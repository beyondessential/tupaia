/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TopProgressBar } from '../components';
import { renderComponent } from './helpers/render.tsx';

describe('Component test', () => {
  it('renders a basic component', () => {
    renderComponent(<TopProgressBar currentSurveyQuestion={1} totalNumberOfSurveyQuestions={2} />);
  });
});
