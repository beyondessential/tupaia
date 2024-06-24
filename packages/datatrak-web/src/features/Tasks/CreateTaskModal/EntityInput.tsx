/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useWatch } from 'react-hook-form';
import { Country, QuestionType } from '@tupaia/types';
import { EntitySelector } from '../../EntitySelector';
import { useCurrentUserContext, useSurvey } from '../../../api';
import { getAllSurveyComponents } from '../../Survey';

interface EntityInputProps {
  onChange: (value: string) => void;
  value: string;
  invalid: boolean;
  selectedCountry?: Country | null;
  ref?: React.Ref<any>;
}

export const EntityInput = ({
  onChange,
  value,
  invalid,
  selectedCountry,
  ref,
}: EntityInputProps) => {
  const { surveyCode } = useWatch('surveyCode');
  const user = useCurrentUserContext();
  const { data: survey, isLoading: isLoadingSurvey } = useSurvey(surveyCode);
  const getPrimaryEntityQuestionConfig = () => {
    if (!survey) return null;
    const flattenedQuestions = getAllSurveyComponents(survey.screens ?? []);
    const primaryEntityQuestion = flattenedQuestions.find(
      question => question.type === QuestionType.PrimaryEntity,
    );
    return primaryEntityQuestion?.config ?? {};
  };

  const primaryEntityQuestionConfig = getPrimaryEntityQuestionConfig();

  return (
    <EntitySelector
      id="entity"
      name="entity"
      required
      controllerProps={{
        onChange,
        value,
        ref,
        invalid,
      }}
      showLegend
      projectCode={user?.project?.code}
      config={primaryEntityQuestionConfig}
      countryCode={selectedCountry?.code}
      showRecentEntities={false}
      disableSearch={!survey || !primaryEntityQuestionConfig}
      isLoading={isLoadingSurvey}
      showSearchInput
      legend="Select entity"
      legendProps={{
        required: true,
        color: 'primary',
      }}
    />
  );
};
