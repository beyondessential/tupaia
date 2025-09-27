import React from 'react';
import { TopProgressBar } from '../components';
import { renderComponent } from './helpers/render.tsx';

describe('Component test', () => {
  it('renders a basic component', async () => {
    await renderComponent(<TopProgressBar currentSurveyQuestion={1} totalNumberOfSurveyQuestions={2} />);
  });
});
