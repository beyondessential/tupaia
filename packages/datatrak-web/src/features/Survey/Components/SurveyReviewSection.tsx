/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useSurveyForm } from '../SurveyContext';
import { SurveyQuestionGroup } from './SurveyQuestionGroup';

const Fieldset = styled.fieldset.attrs({
  disabled: true,
})`
  input,
  label,
  button,
  .MuiInputBase-root,
  link {
    pointer-events: none;
  }
`;
export const SurveyReviewSection = () => {
  const { visibleScreens } = useSurveyForm();

  if (!visibleScreens || !visibleScreens.length) {
    return null;
  }

  // split the questions into sections by screen so it's easier to read the long form
  const questions = visibleScreens.map(screen => screen.surveyScreenComponents).flat();
  return (
    <Fieldset>
      <SurveyQuestionGroup questions={questions} />
    </Fieldset>
  );
};
