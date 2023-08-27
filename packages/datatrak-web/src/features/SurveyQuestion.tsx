// @ts-nocheck
/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { TextField, RadioGroup } from '@tupaia/ui-components';

// Todo: Replace with actual form components in WAITP-1345
const QuestionPlaceholder = styled.div`
  margin-bottom: 0.625rem;
  background: lightgrey;
  padding: 0.5rem 1rem;
  max-width: 30rem;
`;

const Placeholder = ({ name, type }) => {
  return (
    <QuestionPlaceholder>
      <p>Question name: {name}</p>
      <p>Question type: {type}</p>
    </QuestionPlaceholder>
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
  CodeGenerator = Placeholder,
  Arithmetic = Placeholder,
  Condition = Placeholder,
}

interface SurveyQuestionProps {
  type: keyof typeof QUESTION_TYPES;
  name: string;
  label: string;
  id: string;
  code: string;
  text: string;
  options?: any;
  config: any;
  register: any;
}
export const SurveyQuestion = (props: SurveyQuestionProps) => {
  const FieldComponent = QUESTION_TYPES[props.type];

  if (!FieldComponent) {
    return <Text>{props.name}</Text>;
  }

  return <FieldComponent inputRef={props.register()} {...props} />;
};
