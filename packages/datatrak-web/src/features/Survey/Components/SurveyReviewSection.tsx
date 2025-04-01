import React, { ComponentPropsWithoutRef } from 'react';
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
export const SurveyReviewSection = (props: ComponentPropsWithoutRef<typeof Fieldset>) => {
  const { visibleScreens } = useSurveyForm();

  if (!visibleScreens || visibleScreens.length === 0) {
    return null;
  }
  const questions = getAllSurveyComponents(visibleScreens);
  return (
    <Fieldset {...props}>
      <SurveyQuestionGroup questions={questions} />
    </Fieldset>
  );
};
