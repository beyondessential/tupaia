/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import { TextField } from '@tupaia/ui-components';
import { CodeGeneratorQuestion } from '../../components/CodeGeneratorQuestion/CodeGeneratorQuestion';

// Todo: Replace with actual form components in WAITP-1345
const QuestionPlaceholder = styled.div`
  margin-bottom: 0.625rem;
  background: lightgrey;
  padding: 0.5rem 1rem;
  max-width: 30rem;
`;

const Placeholder = ({ name, type, id }) => {
  return (
    <>
      <QuestionPlaceholder id={id}>
        <p>Question name: {name}</p>
        <p>Question type: {type}</p>
      </QuestionPlaceholder>
    </>
  );
};

const InstructionQuestion = ({ text }) => {
  return <QuestionPlaceholder>{text}</QuestionPlaceholder>;
};

export enum QUESTION_TYPES {
  Binary = Placeholder,
  Checkbox = Placeholder,
  Date = Placeholder,
  DateTime = Placeholder,
  FreeText = TextField,
  Geolocate = Placeholder,
  Autocomplete = Placeholder,
  Instruction = InstructionQuestion,
  Number = TextField,
  Photo = Placeholder,
  Radio = Placeholder,
  DaysSince = Placeholder,
  MonthsSince = Placeholder,
  YearsSince = Placeholder,
  SubmissionDate = Placeholder,
  DateOfData = Placeholder,
  Entity = Placeholder,
  PrimaryEntity = Placeholder,
  CodeGenerator = CodeGeneratorQuestion,
  Arithmetic = Placeholder,
  Condition = Placeholder,
}

interface SurveyQuestionProps {
  type: keyof typeof QUESTION_TYPES;
  name: string;
  id: string;
  register?: any;
  label?: string;
  code?: string;
  text?: string;
  options?: any;
  config?: any;
}
export const SurveyQuestion = (props: SurveyQuestionProps) => {
  const FieldComponent = QUESTION_TYPES[props.type];

  if (!FieldComponent) {
    return <QuestionPlaceholder>{props.name}</QuestionPlaceholder>;
  }

  return <FieldComponent inputRef={props.register()} {...props} />;
};
