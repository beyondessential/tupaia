import React from 'react';
import { Typography } from '@material-ui/core';
import { SurveyQuestionInputProps } from '../../types';
import { useSurveyForm } from '..';
import { EntitySelector } from '../EntitySelector';

export const EntityQuestion = ({
  id,
  label,
  name,
  required,
  controllerProps: { onChange, value, ref, invalid },
  config,
}: SurveyQuestionInputProps) => {
  const {
    isReviewScreen,
    isResponseScreen,
    formData,
    countryCode,
    displayQuestions,
    screenHeader,
    surveyProjectCode,
  } = useSurveyForm();

  // Hide the question label if there is only one question, and it is the same as the screen header
  const hideQuestionLabel = displayQuestions?.length === 1 && screenHeader == label;

  return (
    <EntitySelector
      id={id}
      label={hideQuestionLabel ? null : label}
      name={name}
      required={required}
      controllerProps={{
        onChange,
        value,
        ref,
        invalid,
      }}
      showLegend={isReviewScreen || isResponseScreen}
      disableSearch={(isReviewScreen || isResponseScreen) && !value}
      projectCode={surveyProjectCode}
      config={config}
      data={formData}
      countryCode={countryCode}
      showRecentEntities={!isReviewScreen && !isResponseScreen}
      showSearchInput={!isReviewScreen && !isResponseScreen}
      legend={label}
      legendProps={{
        component: Typography,
        variant: 'h4',
      }}
      noResultsMessage={
        isReviewScreen || isResponseScreen ? 'No entity selected' : 'No entities to display'
      }
    />
  );
};
