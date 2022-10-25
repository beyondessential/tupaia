/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { TextField, RadioGroup, DatePicker, DateTimePicker, Select } from '@tupaia/ui-components';

const Text = styled.div`
  margin-bottom: 10px;
`;

const Placeholder = ({ name, type }) => {
  return (
    <Text>
      `${name} - ${type}`
    </Text>
  );
};

const Instruction = ({ text }) => {
  return <Text>{text}</Text>;
};

const BinaryQuestion = ({ options = [], ...props }) => {
  // Todo: check how booleans should be formatted
  return (
    <RadioGroup
      options={[
        {
          label: 'Yes',
          value: 'true',
        },
        {
          label: 'No',
          value: 'false',
        },
      ]}
      {...props}
    />
  );
};

const getFormattedOptions = options => {
  return options.map(x => {
    try {
      // Most of the options data is an array of strings but some of the data is in json
      const optionConfig = JSON.parse(x);
      if (optionConfig && optionConfig.label && optionConfig.value) {
        return optionConfig;
      }
    } catch (e) {
      //
    }

    return { label: x, value: x };
  });
};

const RadioQuestion = ({ options, ...props }) => {
  const formattedOptions = getFormattedOptions(options);
  return <RadioGroup {...props} options={formattedOptions} />;
};

const QUESTION_TYPES = {
  Binary: BinaryQuestion,
  Checkbox: Placeholder,
  Date: Placeholder,
  DateTime: Placeholder,
  FreeText: TextField,
  Geolocate: Placeholder,
  Autocomplete: Placeholder,
  Instruction: Instruction,
  Number: TextField,
  Photo: Placeholder,
  Radio: RadioQuestion,
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

export const SurveyQuestion = ({ register, ...props }) => {
  const FieldComponent = getComponentForQuestionType(props.type);

  if (!FieldComponent) return <Text>{props.name}</Text>;

  return <FieldComponent inputRef={register()} {...props} />;
};
