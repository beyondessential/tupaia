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
  const { countryCode, formData, isResponseScreen, isReviewScreen, surveyProjectCode } =
    useSurveyForm();

  return (
    <EntitySelector
      id={id}
      label={label}
      detailLabel={`Select an entity from the list below ${required ? '*' : ''}`}
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
