/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import { TextField } from '@tupaia/ui-components';
import { useFormContext } from 'react-hook-form';
import { BinaryQuestion, RadioQuestion, TextQuestion } from '../Questions';
import { SurveyQuestionFieldProps } from '../../types';

// Todo: Replace with actual form components in WAITP-1345
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

const InstructionQuestion = ({ text }) => {
  return <QuestionPlaceholder>{text}</QuestionPlaceholder>;
};

export enum QUESTION_TYPES {
  Binary = BinaryQuestion,
  Checkbox = Placeholder,
  Date = Placeholder,
  DateTime = Placeholder,
  FreeText = TextQuestion,
  Geolocate = Placeholder,
  Autocomplete = Placeholder,
  Instruction = InstructionQuestion,
  Number = TextQuestion,
  Photo = Placeholder,
  Radio = RadioQuestion,
  DaysSince = Placeholder,
  MonthsSince = Placeholder,
  YearsSince = Placeholder,
  SubmissionDate = Placeholder,
  DateOfData = Placeholder,
  Entity = Placeholder,
  PrimaryEntity = Placeholder,
  CodeGenerator = Placeholder,
  Arithmetic = Placeholder,
  Condition = Placeholder,
}

export const SurveyQuestion = ({ type, name, ...props }: SurveyQuestionFieldProps) => {
  const { register } = useFormContext();
  const FieldComponent = QUESTION_TYPES[type];

  if (!FieldComponent) {
    return <QuestionPlaceholder>{name}</QuestionPlaceholder>;
  }

  return <FieldComponent {...props} name={name} type={type} inputRef={register()} />;
};
