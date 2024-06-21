/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Modal } from '@tupaia/ui-components';
import { QuestionType } from '@tupaia/types';
import { CountrySelector, useUserCountries } from '../CountrySelector';
import { GroupedSurveyList } from '../GroupedSurveyList';
import { EntitySelector } from '../EntitySelector';
import { useCurrentUserContext, useSurvey } from '../../api';
import { getAllSurveyComponents } from '../Survey';

const CountrySelectorWrapper = styled.div`
  margin-inline-start: auto;
`;

const Form = styled.form`
  .MuiFormLabel-root {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    margin-block-end: 0;
    font-size: 0.875rem;
  }
  .MuiFormLabel-asterisk {
    color: ${({ theme }) => theme.palette.error.main};
  }
`;

const ListSelectWrapper = styled.div`
  margin-block-end: 1rem;
  .list-wrapper {
    height: 15rem;
    max-height: 15rem;
    padding: 1rem;
  }

  .entity-selector-content {
    padding-block: 1rem;
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: 3px;
    .MuiFormControl-root {
      width: auto;
      margin-inline: 1rem;
      padding-block-end: 1rem;
      border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    }
    .list-wrapper {
      border-top: 0;
      margin-block-start: 0;
      padding-block-start: 0;
    }
  }

  .entity-selector-content,
  .list-wrapper {
    margin-block-start: 0.5rem;
  }
`;

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTaskModal = ({ open, onClose }: CreateTaskModalProps) => {
  const user = useCurrentUserContext();
  const formContext = useForm();
  const { handleSubmit, control, watch } = formContext;
  const { countries, isLoading, selectedCountry, updateSelectedCountry } = useUserCountries();

  const onSubmit = data => {};

  const surveyCode = watch('survey');
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
  ``;

  return (
    <Modal isOpen={open} onClose={onClose} title="New task">
      <CountrySelectorWrapper>
        <CountrySelector
          countries={countries}
          selectedCountry={selectedCountry}
          onChangeCountry={updateSelectedCountry}
        />
      </CountrySelectorWrapper>
      <FormProvider {...formContext}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="survey"
            control={control}
            rules={{ required: 'Required' }}
            render={({ onChange, value }) => (
              <ListSelectWrapper>
                <GroupedSurveyList
                  selectedSurvey={value}
                  setSelectedSurvey={onChange}
                  selectedCountry={selectedCountry}
                  label="Select survey"
                  labelProps={{
                    required: true,
                    color: 'primary',
                    component: 'label',
                  }}
                />
              </ListSelectWrapper>
            )}
          />
          <Controller
            name="entity"
            control={control}
            rules={{ required: 'Required' }}
            render={({ onChange, value, ref }, { invalid }) => (
              <ListSelectWrapper>
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
              </ListSelectWrapper>
            )}
          />
          {/* <Button type="submit">Create task</Button> */}
        </Form>
      </FormProvider>
    </Modal>
  );
};
