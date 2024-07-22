/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Typography } from '@material-ui/core';
import { SurveyQuestionInputProps } from '../../types';
import { useSurveyForm } from '..';
import { EntitySelector } from '../EntitySelector';

export const EntityQuestion = ({
  id,
  label,
  detailLabel,
  name,
  required,
  controllerProps: { onChange, value, ref, invalid },
  config,
}: SurveyQuestionInputProps) => {
  const { isReviewScreen, isResponseScreen, formData, countryCode } = useSurveyForm();

  const { surveyProjectCode } = useSurveyForm();

  return (
    <EntitySelector
      id={id}
      label={label}
      detailLabel={detailLabel}
      name={name}
      required={required}
      controllerProps={{
        onChange,
        value,
        ref,
        invalid,
      }}
      showLegend={isReviewScreen || isResponseScreen}
      projectCode={surveyProjectCode}
      config={config}
      data={formData}
      countryCode={countryCode}
      showRecentEntities
      showSearchInput={!isReviewScreen && !isResponseScreen}
      legend={label}
      legendProps={{
        component: Typography,
        variant: 'h4',
      }}
    />
  );
};
