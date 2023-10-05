/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import { useFormContext, Controller } from 'react-hook-form';
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
  ...props
}: SurveyQuestionFieldProps) => {
  const { control } = useFormContext();
  const { setSingleAnswer } = useSurveyForm();
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

  // Use a Controller so that the fields that require change handlers, values, etc work with react-hook-form, which is uncontrolled by default
  return (
    <Controller
      name={getNameForController(name, type)}
      control={control}
      render={({ onChange, ref, ...renderProps }) => (
        <FieldComponent
          {...props}
          controllerProps={{
            ...renderProps,
            ref,
            onChange: e => {
              handleOnChange(e);
              onChange(e);
            },
          }}
          name={name}
          type={type}
        />
      )}
    />
  );
};
