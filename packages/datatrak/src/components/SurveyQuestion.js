/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { TextField, RadioGroup, DatePicker, DateTimePicker, Select } from '@tupaia/ui-components';

const Text = styled.div`
  margin-bottom: 10px;
`;

const Placeholder = ({ name, type, ...props }) => {
  return (
    <Text>
      `${name} - ${type}`
    </Text>
  );
};

const Instruction = ({ text }) => {
  return <Text>{text}</Text>;
};

const QUESTION_TYPES = {
  Binary: Placeholder,
  Checkbox: Placeholder,
  Date: Placeholder,
  DateTime: Placeholder,
  FreeText: TextField,
  Geolocate: Placeholder,
  Autocomplete: Placeholder,
  Instruction: Instruction,
  Number: TextField,
  Photo: Placeholder,
  Radio: Select, // or Radio Group
  DaysSince: Placeholder,
  MonthsSince: Placeholder,
  YearsSince: Placeholder,
  SubmissionDate: Placeholder,
  DateOfData: Placeholder,
  Entity: Placeholder,
  PrimaryEntity: Placeholder,
  CodeGenerator: Placeholder,
  Arithmetic: Placeholder,
  Condition: Placeholder,
};

const getComponentForQuestionType = type => {
  return QUESTION_TYPES[type];
};

export const SurveyQuestion = props => {
  if (props.config) {
    console.log('config', props.config);
  }

  // const options = mapOptionsToValues(componentOptions || defaultOptions);
  const FieldComponent = getComponentForQuestionType(props.type);

  if (!FieldComponent) return <Text>{props.name}</Text>;

  return <FieldComponent {...props} />;
};
