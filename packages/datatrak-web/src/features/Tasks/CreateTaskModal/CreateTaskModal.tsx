/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { LoadingContainer, Modal, TextField } from '@tupaia/ui-components';
import { ButtonProps } from '@material-ui/core';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../constants';
import { useCreateTask, useEditUser, useUser } from '../../../api';
import { CountrySelector, useUserCountries } from '../../CountrySelector';
import { GroupedSurveyList } from '../../GroupedSurveyList';
import { DueDatePicker } from '../DueDatePicker';
import { AssigneeInput } from '../AssigneeInput';
import { TaskForm } from '../TaskForm';
import { RepeatScheduleInput } from '../RepeatScheduleInput';
import { EntityInput } from './EntityInput';

const CountrySelectorWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  .MuiInputBase-input.MuiSelect-selectMenu {
    font-size: 0.75rem;
  }
`;

const ListSelectWrapper = styled.div`
  margin-block-end: 1.8rem;
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
`;

const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-block-end: 1.2rem;
  > div {
    width: 48%;
    margin-block-end: 0;
  }
`;

const CommentsInput = styled(TextField).attrs({
  multiline: true,
  variant: 'outlined',
  fullWidth: true,
  rows: 4,
})`
  .MuiOutlinedInput-inputMultiline {
    padding-inline: 1rem;
  }
`;

const Wrapper = styled.div`
  .loading-screen {
    border: none;
    background-color: ${({ theme }) => theme.palette.background.paper};
    .MuiTypography-h5 {
      font-size: 1.125rem;
    }
  }
`;

interface CreateTaskModalProps {
  onClose: () => void;
}

export const CreateTaskModal = ({ onClose }: CreateTaskModalProps) => {
  const navigate = useNavigate();
  const navigateToProjectScreen = () => {
    navigate(ROUTES.PROJECT_SELECT);
  };
  const { mutate: editUser } = useEditUser(navigateToProjectScreen);

  const generateDefaultDueDate = () => {
    const now = new Date();
    now.setHours(23, 59, 59);
    return new Date(now);
  };

  const defaultDueDate = generateDefaultDueDate();
  const defaultValues = {
    survey_code: null,
    entity_id: null,
    due_date: defaultDueDate,
    repeat_frequency: null,
    assignee_id: null,
  };
  const formContext = useForm({
    mode: 'onChange',
    defaultValues,
  });
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    register,
    formState: { isValid, dirtyFields },
  } = formContext;

  const handleCountriesError = async (error: any) => {
    if (error?.code !== 403) return;
    // in this case it is a permissions error, so the user needs to be redirected to the project screen after the user's project is updated
    editUser({ projectId: null });
  };

  const {
    countries,
    selectedCountry,
    updateSelectedCountry,
    isLoading: isLoadingCountries,
  } = useUserCountries(handleCountriesError);
  const { isLoading: isLoadingUser, isFetching: isFetchingUser } = useUser();

  const isLoadingData = isLoadingCountries || isLoadingUser || isFetchingUser;
  const { mutate: createTask, isLoading: isSaving } = useCreateTask(onClose);

  const buttons: {
    text: string;
    onClick: () => void;
    variant?: ButtonProps['variant']; // typing here because simply giving 'outlined' as default value is causing a type mismatch error
    id: string;
    disabled?: boolean;
  }[] = [
    {
      text: 'Cancel',
      onClick: onClose,
      variant: 'outlined',
      id: 'cancel',
      disabled: isSaving,
    },
    {
      text: 'Save',
      onClick: handleSubmit(createTask),
      id: 'save',
      disabled: !isValid || isSaving || isLoadingData,
    },
  ];

  useEffect(() => {
    if (!selectedCountry?.code) return;
    const { survey_code: surveyCode, entity_id: entityId } = dirtyFields;
    // reset surveyCode and entityId when country changes, if they are dirty
    if (surveyCode) {
      setValue('survey_code', null, { shouldValidate: true });
    }
    if (entityId) {
      setValue('entity_id', null, { shouldValidate: true });
    }
  }, [selectedCountry?.code]);

  const surveyCode = watch('survey_code');
  const dueDate = watch('due_date');

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="New task"
      buttons={buttons}
      isLoading={isSaving}
      disablePortal
    >
      <Wrapper>
        <LoadingContainer isLoading={isLoadingData} heading="Loading data for project" text="">
          <FormProvider {...formContext}>
            <TaskForm onSubmit={handleSubmit(createTask)}>
              <CountrySelectorWrapper>
                <CountrySelector
                  countries={countries}
                  selectedCountry={selectedCountry}
                  onChangeCountry={updateSelectedCountry}
                />
              </CountrySelectorWrapper>
              <Controller
                name="survey_code"
                control={control}
                rules={{ required: '*Required' }}
                render={({ onChange, value }, { invalid }) => (
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
                        error: invalid,
                      }}
                      error={invalid ? '*Required' : undefined}
                    />
                  </ListSelectWrapper>
                )}
              />
              <Controller
                name="entity_id"
                control={control}
                rules={{ required: '*Required' }}
                render={({ onChange, value, ref, name }, { invalid }) => {
                  return (
                    <ListSelectWrapper>
                      <EntityInput
                        onChange={onChange}
                        value={value}
                        selectedCountry={selectedCountry}
                        inputRef={ref}
                        name={name}
                        invalid={invalid}
                        surveyCode={surveyCode}
                      />
                    </ListSelectWrapper>
                  );
                }}
              />
              <InputRow>
                <Controller
                  name="due_date"
                  rules={{ required: '*Required' }}
                  control={control}
                  defaultValue={defaultDueDate}
                  render={({ ref, value, onChange, ...field }, { invalid }) => {
                    return (
                      <DueDatePicker
                        {...field}
                        value={value}
                        onChange={onChange}
                        inputRef={ref}
                        label="Due date"
                        disablePast
                        fullWidth
                        required
                        invalid={invalid}
                        helperText={invalid ? '*Required' : undefined}
                      />
                    );
                  }}
                />
                <Controller
                  name="repeat_frequency"
                  control={control}
                  render={({ onChange, value }) => (
                    <RepeatScheduleInput value={value} onChange={onChange} dueDate={dueDate} />
                  )}
                />
              </InputRow>

              <InputRow>
                <Controller
                  name="assignee_id"
                  control={control}
                  render={({ ref, value, onChange, ...field }) => (
                    <AssigneeInput
                      {...field}
                      value={value}
                      onChange={onChange}
                      inputRef={ref}
                      countryCode={selectedCountry?.code}
                      surveyCode={surveyCode}
                    />
                  )}
                />
              </InputRow>

              <CommentsInput label="Comments" name="comment" inputRef={register} />
            </TaskForm>
          </FormProvider>
        </LoadingContainer>
      </Wrapper>
    </Modal>
  );
};
