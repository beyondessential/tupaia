// @ts-nocheck
/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { TextField, RadioGroup } from '@tupaia/ui-components';

const Text = styled.div`
  margin-bottom: 0.625rem;
`;

// Todo: Replace with actual components
const Placeholder = ({ name, type }) => {
  return (
    <Text>
      `${name} - ${type}`
    </Text>
  );
};

const InstructionQuestion = ({ text }) => {
  return <Text>{text}</Text>;
};

const BinaryQuestion = ({ options = [], ...props }) => {
  return (
    <RadioGroup
      options={[
        {
          label: 'Yes',
          value: 'Yes',
        },
        {
          label: 'No',
          value: 'No',
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

export enum QUESTION_TYPES {
  Binary = BinaryQuestion,
  Checkbox = Placeholder,
  Date = Placeholder,
  DateTime = Placeholder,
  FreeText = TextField,
  Geolocate = Placeholder,
  Autocomplete = Placeholder,
  Instruction = InstructionQuestion,
  Number = TextField,
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

interface SurveyQuestionProps {
  type: keyof typeof QUESTION_TYPES;
  name: string;
  label: string;
}
export const SurveyQuestion = (props: SurveyQuestionProps) => {
  const FieldComponent = QUESTION_TYPES[props.type];

  if (!FieldComponent) {
    return <Text>{props.name}</Text>;
  }

  return <FieldComponent {...props} />;
};
