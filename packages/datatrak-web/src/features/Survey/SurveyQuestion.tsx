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
} from '../Questions';
import { SurveyQuestionFieldProps } from '../../types';

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
  Geolocate = GeolocateQuestion,
  Autocomplete = Placeholder,
  Instruction = InstructionQuestion,
  Number = TextQuestion,
  Photo = Placeholder,
  Radio = RadioQuestion,
  SubmissionDate = DateQuestion,
  DateOfData = DateQuestion,
  Entity = Placeholder,
  PrimaryEntity = Placeholder,
  CodeGenerator = CodeGeneratorQuestion,
  Arithmetic = Placeholder,
  Condition = Placeholder,
}

export const SurveyQuestion = ({ type, name, ...props }: SurveyQuestionFieldProps) => {
  const { control } = useFormContext();
  const FieldComponent = QUESTION_TYPES[type];

  if (!FieldComponent) {
    return <QuestionPlaceholder>{name}</QuestionPlaceholder>;
  }

  // Use a Controller so that the fields that require change handlers, values, etc work with react-hook-form, which is uncontrolled by default
  return (
    <Controller
      name={name!}
      control={control}
      render={renderProps => (
        <FieldComponent
          {...props}
          controllerProps={renderProps}
          name={name}
          type={type}
          ref={renderProps.ref}
        />
      )}
    />
  );
};
