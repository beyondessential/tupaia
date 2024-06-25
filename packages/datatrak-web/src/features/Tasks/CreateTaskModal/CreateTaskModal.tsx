/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Modal, TextField } from '@tupaia/ui-components';
import { CountrySelector, useUserCountries } from '../../CountrySelector';
import { GroupedSurveyList } from '../../GroupedSurveyList';
import { DueDatePicker } from '../DueDatePicker';
import { RepeatScheduleInput } from './RepeatScheduleInput';
import { EntityInput } from './EntityInput';
import { AssigneeInput } from './AssigneeInput';

const CountrySelectorWrapper = styled.div`
  margin-inline-start: auto;
`;

const Form = styled.form`
  .MuiFormLabel-root {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    margin-block-end: 0.2rem;
    font-size: 0.875rem;
  }
  .MuiFormLabel-asterisk {
    color: ${({ theme }) => theme.palette.error.main};
  }
  .MuiInputBase-root {
    font-size: 0.875rem;
  }
  .MuiOutlinedInput-input {
    padding-block: 0.9rem;
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
`;

const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-block-end: 1rem;
  > * {
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

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTaskModal = ({ open, onClose }: CreateTaskModalProps) => {
  const formContext = useForm({
    mode: 'onChange',
  });
  const { handleSubmit, control } = formContext;
  const { countries, isLoading, selectedCountry, updateSelectedCountry } = useUserCountries();

  const onSubmit = data => {};

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
            name="surveyCode"
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
                <EntityInput
                  onChange={onChange}
                  value={value}
                  invalid={invalid}
                  selectedCountry={selectedCountry}
                  ref={ref}
                />
              </ListSelectWrapper>
            )}
          />
          <InputRow>
            <Controller
              name="dueDate"
              control={control}
              render={({ ref, value, onChange, ...field }) => (
                <DueDatePicker
                  {...field}
                  value={value}
                  onChange={onChange}
                  inputRef={ref}
                  label="Due date"
                  disablePast
                  fullWidth
                  required
                />
              )}
            />
            <Controller
              name="repeatSchedule"
              control={control}
              render={({ onChange, value }) => (
                <RepeatScheduleInput value={value} onChange={onChange} />
              )}
            />
          </InputRow>

          <InputRow>
            <Controller
              name="assigneeId"
              control={control}
              render={({ ref, value, onChange, ...field }) => (
                <AssigneeInput
                  {...field}
                  value={value}
                  onChange={onChange}
                  inputRef={ref}
                  selectedCountry={selectedCountry}
                />
              )}
            />
          </InputRow>

          {/** This is a placeholder for when we add in comments functionality */}
          <CommentsInput label="Comments" />
          {/* <Button type="submit">Create task</Button> */}
        </Form>
      </FormProvider>
    </Modal>
  );
};
