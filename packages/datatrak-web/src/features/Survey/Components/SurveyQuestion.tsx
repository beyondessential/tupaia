/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import { useFormContext, Controller } from 'react-hook-form';
import { FormHelperText } from '@material-ui/core';
import {
  BinaryQuestion,
  DateQuestion,
  RadioQuestion,
  TextQuestion,
  InstructionQuestion,
  CheckboxQuestion,
  DateTimeQuestion,
  GeolocateQuestion,
  CodeGeneratorQuestion,
  EntityQuestion,
  AutocompleteQuestion,
} from '../../Questions';
import { SurveyQuestionFieldProps } from '../../../types';
import { useSurveyForm } from '..';

const QuestionPlaceholder = styled.div`
  margin-bottom: 0.625rem;
  background: lightgrey;
  padding: 0.5rem 1rem;
  max-width: 30rem;
`;

const Placeholder = ({ name, type, id }) => {
  return (
    <QuestionPlaceholder id={id}>
      <p>Question name: {name}</p>
      <p>Question type: {type}</p>
    </QuestionPlaceholder>
  );
};

const QuestionWrapper = styled.div`
  width: 100%;
  .MuiFormHelperText-root.Mui-error {
    color: ${props => props.theme.palette.error.dark};
  }
`;

export enum QUESTION_TYPES {
  Binary = BinaryQuestion,
  Checkbox = CheckboxQuestion,
  Date = DateQuestion,
  DateTime = DateTimeQuestion,
  FreeText = TextQuestion,
  Entity = EntityQuestion,
  Geolocate = GeolocateQuestion,
  Autocomplete = AutocompleteQuestion,
  Instruction = InstructionQuestion,
  Number = TextQuestion,
  Photo = Placeholder,
  Radio = RadioQuestion,
  SubmissionDate = DateQuestion,
  DateOfData = DateQuestion,
  PrimaryEntity = EntityQuestion,
  CodeGenerator = CodeGeneratorQuestion,
  Arithmetic = Placeholder,
  Condition = Placeholder,
}

const getNameForController = (name, type) => {
  return type === 'PrimaryEntity' ? 'entityId' : name;
};

/**
 * This is the component that renders a single question in a survey.
 */
export const SurveyQuestion = ({
  type,
  name,
  updateFormDataOnChange,
  validationCriteria = {},
  ...props
}: SurveyQuestionFieldProps) => {
  const { control, errors } = useFormContext();
  const { setSingleAnswer, formData } = useSurveyForm();
  const FieldComponent = QUESTION_TYPES[type];

  if (!FieldComponent) {
    return <QuestionPlaceholder>{name}</QuestionPlaceholder>;
  }

  // If the question dictates the visibility of any other questions, we need to update the formData when the value changes, so the visibility of other questions can be updated in real time. This doesn't happen that often, so it shouldn't have too much of a performance impact, and we are only updating the formData for the question that is changing, not the entire formData object.
  const handleOnChange = e => {
    if (updateFormDataOnChange) {
      setSingleAnswer(name, e.target.value);
    }
  };

  const { mandatory: required, min, max } = validationCriteria;

  const getRules = () => {
    // If the question is an instruction, we don't need to validate it, it will never need to be answered
    if (type === 'Instruction') {
      return {};
    }
    // If the question is a geolocate question, we need to validate it differently, as it is a compound question. The coordinates need to be validated separately.
    if (type === 'Geolocate') {
      return {
        validate: {
          required: value => (value?.latitude && value?.longitude) || 'Required',
          coordinatesAreValid: value => {
            return value?.latitude < -90 ||
              value?.latitude > 90 ||
              value?.longitude < -180 ||
              value?.longitude > 180
              ? 'Invalid coordinates'
              : true;
          },
        },
      };
    }
    return {
      required: required ? 'Required' : false,
      min: min ? { value: min, message: `Minimum value is ${min}` } : undefined,
      max: max ? { value: max, message: `Maximum value is ${max}` } : undefined,
    };
  };

  const controllerName = getNameForController(name, type);

  const getDefaultValue = () => {
    if (type?.includes('Date')) return new Date();
    return formData[controllerName] || '';
  };

  const rules = getRules();

  const defaultValue = getDefaultValue();

  // display the entity error in it's own component because otherwise it will end up at the bottom of the big list of entities
  const displayError = errors[name] && errors[name].message && !type.includes('Entity');
  // Use a Controller so that the fields that require change handlers, values, etc work with react-hook-form, which is uncontrolled by default
  return (
    <QuestionWrapper>
      <Controller
        name={controllerName}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={({ onChange, ref, ...renderProps }, { invalid }) => (
          <FieldComponent
            {...props}
            controllerProps={{
              ...renderProps,
              invalid,
              ref,
              onChange: e => {
                handleOnChange(e);
                onChange(e);
              },
            }}
            required={required}
            min={min}
            max={max}
            name={controllerName}
            type={type}
            ref={ref}
          />
        )}
      />
      {displayError && <FormHelperText error>*{errors[name].message}</FormHelperText>}
    </QuestionWrapper>
  );
};
