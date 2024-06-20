/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { SurveyQuestionInputProps } from '../../../types';
import { useSurveyForm } from '../..';
import { EntitySelector } from '../../EntitySelector';
import { useEntityBaseFilters } from './utils';

export const EntityQuestion = ({
  id,
  label,
  detailLabel,
  name,
  required,
  controllerProps: { onChange, value, ref, invalid },
  config,
}: SurveyQuestionInputProps) => {
  const { isReviewScreen, isResponseScreen } = useSurveyForm();

  const filter = useEntityBaseFilters(config);

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
      config={config}
      showLabel={isReviewScreen || isResponseScreen}
      filter={filter}
      projectCode={surveyProjectCode}
    />
  );
};
