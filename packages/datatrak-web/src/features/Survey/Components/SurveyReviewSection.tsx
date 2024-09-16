/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { getAllSurveyComponents } from '../utils';
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
  const questions = getAllSurveyComponents(visibleScreens);
  return (
    <Fieldset>
      <SurveyQuestionGroup questions={questions} />
    </Fieldset>
  );
};
