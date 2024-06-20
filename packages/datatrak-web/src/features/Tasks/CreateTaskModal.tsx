/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from '@tupaia/ui-components';
import { CountrySelector, useUserCountries } from '../CountrySelector';
import { GroupedSurveyList } from '../GroupedSurveyList';

const CountrySelectorWrapper = styled.div`
  margin-inline-start: auto;
`;

const Form = styled.form`
  .MuiFormLabel-root {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    margin-block-end: 0.5rem;
  }
  .MuiFormLabel-asterisk {
    color: ${({ theme }) => theme.palette.error.main};
  }
`;

const SurveySelectWrapper = styled.div`
  .list-wrapper {
    height: 15rem;
    max-height: 15rem;
    overflow-y: auto;
  }
`;

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTaskModal = ({ open, onClose }: CreateTaskModalProps) => {
  const { handleSubmit, control } = useForm();
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
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="survey"
          control={control}
          rules={{ required: 'Required' }}
          render={({ onChange, value }) => (
            <SurveySelectWrapper>
              <GroupedSurveyList
                selectedSurvey={value}
                setSelectedSurvey={onChange}
                selectedCountry={selectedCountry}
                label="Select survey"
                labelProps={{
                  required: true,
                  color: 'primary',
                  component: 'h2',
                }}
              />
            </SurveySelectWrapper>
          )}
        />
        {/* <Button type="submit">Create task</Button> */}
      </Form>
    </Modal>
  );
};
