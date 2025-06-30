import React from 'react';
import { EntityTypeEnum, QuestionType, DatatrakWebEntitiesRequest } from '@tupaia/types';

import { EntitySelector } from '../../EntitySelector';
import { useCurrentUserContext, useSurvey } from '../../../api';
import { getAllSurveyComponents } from '../../Survey';

interface EntityInputProps {
  onChange: (value: string) => void;
  value: string;
  selectedCountry?: DatatrakWebEntitiesRequest.EntitiesResponseItem | null;
  inputRef?: React.Ref<any>;
  name: string;
  invalid?: boolean;
  surveyCode?: string;
}

export const EntityInput = ({
  onChange,
  value,
  selectedCountry,
  inputRef,
  name,
  invalid,
  surveyCode,
}: EntityInputProps) => {
  const user = useCurrentUserContext();
  const { data: survey, isLoading: isLoadingSurvey } = useSurvey(surveyCode);
  const getPrimaryEntityQuestionConfig = () => {
    if (!survey) return null;
    const flattenedQuestions = getAllSurveyComponents(survey.screens ?? []);
    const primaryEntityQuestion = flattenedQuestions.find(
      question => question.type === QuestionType.PrimaryEntity,
    );
    if (primaryEntityQuestion?.config?.entity?.filter) return primaryEntityQuestion.config;
    // default to country filter if no primary entity question is found or it doesn't have an entity filter
    return {
      entity: {
        filter: {
          type: EntityTypeEnum.country,
        },
      },
    };
  };

  const primaryEntityQuestionConfig = getPrimaryEntityQuestionConfig();

  return (
    <EntitySelector
      id={name}
      name={name}
      required
      controllerProps={{
        onChange,
        value,
        ref: inputRef,
      }}
      showLegend
      projectCode={user?.project?.code}
      config={primaryEntityQuestionConfig}
      countryCode={selectedCountry?.code}
      showRecentEntities={false}
      disableSearch={!survey || !primaryEntityQuestionConfig}
      isLoading={isLoadingSurvey}
      showSearchInput
      legend="Entity"
      legendProps={{
        required: true,
        color: 'primary',
        error: invalid,
      }}
    />
  );
};
