import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocation } from 'react-router';
import styled from 'styled-components';
import { SurveyScreenComponent } from '../../../types';
import { SurveyQuestion } from './SurveyQuestion';

const QuestionWrapper = styled.div`
  display: flex;
  & + & {
    margin-block-start: 2.5rem;
  }
  .MuiFormLabel-root {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

/**
 * This is the component that renders questions in a survey.
 */
export const SurveyQuestionGroup = ({ questions }: { questions: SurveyScreenComponent[] }) => {
  const { setError, errors } = useFormContext();
  const location = useLocation() as { state: { errors?: string } };

  // Set errors from location state, if any. This is so that we can show errors from the review screen
  useEffect(() => {
    if (location?.state?.errors) {
      const parsedErrors = JSON.parse(location.state.errors);
      const entries = Object.entries(parsedErrors);
      for (const [questionId, error] of entries) setError(questionId, error);
    }
  }, [location?.state?.errors]);

  // focus the first error. This is mainly for when the user is directed from the review screen, because we have to manually set them
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0] as {
        ref: { focus: () => void };
      };

      firstError.ref?.focus();
    }
  }, [JSON.stringify(errors)]);
  return (
    <>
      {questions?.map(
        ({
          questionId,
          code,
          text,
          type,
          options,
          config,
          label,
          validationCriteria,
          detailLabel,
          detail,
          optionSetId,
          updateFormDataOnChange,
        }) => {
          return (
            <QuestionWrapper key={questionId}>
              <SurveyQuestion
                detailLabel={detailLabel || detail}
                id={questionId}
                code={code}
                name={questionId}
                type={type}
                text={text}
                options={options}
                config={config}
                label={label || text}
                optionSetId={optionSetId}
                updateFormDataOnChange={updateFormDataOnChange}
                validationCriteria={validationCriteria}
              />
            </QuestionWrapper>
          );
        },
      )}
    </>
  );
};
