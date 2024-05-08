/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FileUploadField } from '@tupaia/ui-components';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Controller, useForm } from 'react-hook-form';
import { Breadcrumbs } from '../../layout';
import { useItemDetails } from '../../api/queries/useResourceDetails';
import { ReduxAutocomplete } from '../../autocomplete';

const Form = styled.form`
  padding: 1.5rem;
`;

const Section = styled.section`
  padding-block-end: 1.8rem;
  & + & {
    border-top: 1px solid ${({ theme }) => theme.palette.grey[400]};
  }
`;

export const EditSurveyPage = ({ parent, title, displayProperty, getDisplayValue, fields }) => {
  const { '*': unusedParam, locale, ...params } = useParams();
  const { data: details } = useItemDetails(params, parent);
  const { handleSubmit, control } = useForm();

  console.log(fields);

  const onSubmit = data => {
    console.log(data);
  };
  return (
    <div>
      <Breadcrumbs
        parent={parent}
        title={details?.name}
        displayProperty={displayProperty}
        details={details}
        getDisplayValue={getDisplayValue}
      />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Section>
          <Controller
            render={({ onChange, value, ref }) => {
              return (
                <FileUploadField
                  id="survey-questions"
                  name="survey-questions"
                  onChange={onChange}
                  accept=".json"
                  fileName={value?.replace(/^.*[\\/]/, '')}
                  ref={ref}
                  label="Survey questions"
                />
              );
            }}
            control={control}
            name="survey-questions"
          />
        </Section>
        <Section>
          <Controller
            render={({ onChange, value, ref }) => {
              return (
                <ReduxAutocomplete
                  {...fields.project.editConfig}
                  onChange={onChange}
                  value={value}
                />
              );
            }}
            control={control}
            name="survey-answers"
          />
        </Section>
      </Form>
    </div>
  );
};

EditSurveyPage.propTypes = {
  parent: PropTypes.object,
  displayProperty: PropTypes.string,
  title: PropTypes.string,
  getDisplayValue: PropTypes.func,
  fields: PropTypes.object.isRequired,
};

EditSurveyPage.defaultProps = {
  parent: null,
  displayProperty: 'id',
  title: '',
  getDisplayValue: null,
};
