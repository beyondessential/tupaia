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

// question types which can control other questions via on visibility criteria
const DEPENDABLE_QUESTION_TYPES = [
  'Entity',
  'PrimaryEntity',
  'Autocomplete',
  'Binary',
  'Checkbox',
  'Radio',
];

/**
 * This is the component that renders a single question in a survey.
 */
export const SurveyQuestion = ({ type, name, ...props }: SurveyQuestionFieldProps) => {
  const { control } = useFormContext();
  const { shouldUpdateScreenOnChange, setFormData, formData } = useSurveyForm();
  const FieldComponent = QUESTION_TYPES[type];

  if (!FieldComponent) {
    return <QuestionPlaceholder>{name}</QuestionPlaceholder>;
  }

  // If the question is a dependable question, update the form data when the value changes. This is so that if there are questions on the same screen that depend on the value of this question, they will be updated when the value changes. This shouldn't have much of a performance impact because the type of questions that are involved are clickable instead of type-able.
  const handleOnChange = e => {
    if (shouldUpdateScreenOnChange && DEPENDABLE_QUESTION_TYPES.includes(type)) {
      setFormData({
        ...formData,
        [name]: e.target.value,
      });
    }
  };

  // Use a Controller so that the fields that require change handlers, values, etc work with react-hook-form, which is uncontrolled by default
  return (
    <Controller
      name={getNameForController(name, type)}
      control={control}
      render={renderProps => (
        <FieldComponent
          {...props}
          controllerProps={{
            ...renderProps,
            onChange: e => {
              handleOnChange(e);
              renderProps.onChange(e);
            },
          }}
          name={name}
          type={type}
          ref={renderProps.ref}
        />
      )}
    />
  );
};
