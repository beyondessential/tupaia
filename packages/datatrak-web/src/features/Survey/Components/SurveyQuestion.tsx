// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import { useFormContext, Controller } from 'react-hook-form';
import { FormHelperText } from '@material-ui/core';
import { stripTimezoneFromDate } from '@tupaia/utils';
import {
  BinaryQuestion,
  DateQuestion,
  RadioQuestion,
  TextQuestion,
  InstructionQuestion,
  CheckboxQuestion,
  DateTimeQuestion,
  GeolocateQuestion,
  EntityQuestion,
  AutocompleteQuestion,
  ReadOnlyQuestion,
  PhotoQuestion,
  FileQuestion,
  UserQuestion,
} from '../../Questions';
import { SurveyQuestionFieldProps } from '../../../types';
import { useSurveyForm } from '..';
import { READ_ONLY_QUESTION_TYPES } from '../utils';

const QuestionPlaceholder = styled.div`
  margin-bottom: 0.625rem;
  background: lightgrey;
  padding: 0.5rem 1rem;
  max-width: 30rem;
`;

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
  Photo = PhotoQuestion,
  Radio = RadioQuestion,
  SubmissionDate = DateQuestion,
  DateOfData = DateQuestion,
  PrimaryEntity = EntityQuestion,
  CodeGenerator = ReadOnlyQuestion,
  Arithmetic = ReadOnlyQuestion,
  Condition = ReadOnlyQuestion,
  File = FileQuestion,
  User = UserQuestion,
}

/**
 * This is the component that renders a single question in a survey.
 */
export const SurveyQuestion = ({
  type,
  name,
  updateFormDataOnChange,
  validationCriteria,
  ...props
}: SurveyQuestionFieldProps) => {
  const { control, errors } = useFormContext();
  const { updateFormData, formData, isResubmit } = useSurveyForm();
  const FieldComponent = QUESTION_TYPES[type];

  if (!FieldComponent) {
    return <QuestionPlaceholder>{name}</QuestionPlaceholder>;
  }

  // Because the readOnly questions are not actually inputs, they won't get re-rendered on each associated question update, because they're not really controlled by react-hook-form. So instead of using a controller, we can just render the component and the component can take care of grabbing the value and displaying it.
  if (READ_ONLY_QUESTION_TYPES.includes(type)) {
    return <FieldComponent {...props} name={name} type={type} />;
  }

  const { mandatory: required, min, max } = validationCriteria || {};

  const getDefaultValue = () => {
    if (formData[name] !== undefined) return formData[name];
    // This is so that the default value gets carried through to the component, and dates that have a visible value of 'today' have that value recognised when validating
    if (type?.includes('Date')) {
      return isResubmit ? null : stripTimezoneFromDate(new Date());
    }
    return undefined;
  };

  const defaultValue = getDefaultValue();

  // Display the entity error in its own component because otherwise it will end up at the bottom of the big list of entities
  const displayError = errors[name]?.message && !type.includes('Entity');

  return (
    <QuestionWrapper>
      {/* Use a Controller so that the fields that require change handlers, values, etc. work with
          react-hook-form, which is uncontrolled by default */}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ onChange, ref, ...renderProps }, { invalid }) => (
          <FieldComponent
            {...props}
            controllerProps={{
              ...renderProps,
              invalid,
              ref,
              onChange: (newValue: unknown, rawValue: unknown = newValue) => {
                // If the question dictates the visibility of any other questions, we need to update the formData when the value changes,
                // so the visibility of other questions can be updated in real time. This doesn't happen that often, so it shouldn't have too much of a performance impact,
                // and we are only updating the formData for the question that is changing, not the entire formData object.
                if (updateFormDataOnChange) {
                  updateFormData({
                    [name]: rawValue,
                  });
                }
                onChange(newValue);
              },
            }}
            required={required}
            min={min}
            max={max}
            name={name}
            type={type}
          />
        )}
      />
      {displayError && <FormHelperText error>*{errors[name].message}</FormHelperText>}
    </QuestionWrapper>
  );
};
