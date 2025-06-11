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

  const isReadOnly = isReviewScreen || isResponseScreen;

  return (
    <EntitySelector
      id={id}
      label={label}
      name={name}
      required={required}
      controllerProps={{
        onChange,
        value,
        ref,
        invalid,
      }}
      showLegend={isReadOnly}
      disableSearch={isReadOnly && !value}
      projectCode={surveyProjectCode}
      config={config}
      data={formData}
      countryCode={countryCode}
      showRecentEntities={!isReadOnly}
      showSearchInput={!isReadOnly}
      legend={label}
      legendProps={{
        component: Typography,
        variant: 'h4',
      }}
      noResultsMessage={isReadOnly ? 'No entity selected' : 'No entities to display'}
    />
  );
};
