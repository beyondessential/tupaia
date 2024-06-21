/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router';
import { SurveyQuestionInputProps } from '../../types';
import { useSurveyForm } from '..';
import { EntitySelector } from '../EntitySelector';
import { Typography } from '@material-ui/core';

export const EntityQuestion = ({
  id,
  label,
  detailLabel,
  name,
  required,
  controllerProps: { onChange, value, ref, invalid },
  config,
}: SurveyQuestionInputProps) => {
  const { countryCode } = useParams();
  const { isReviewScreen, isResponseScreen, formData } = useSurveyForm();

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
      showSearchInput={isReviewScreen || isResponseScreen}
      legend={label}
      legendProps={{
        component: Typography,
        variant: 'h4',
      }}
    />
  );
};
