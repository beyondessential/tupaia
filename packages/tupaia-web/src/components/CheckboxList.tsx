/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { CheckboxField } from '.';

const Legend = styled.legend`
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const ErrorLabel = styled(Typography).attrs({
  color: 'error',
})`
  margin-block-end: 0.5rem;
  text-align: start;
`;

interface CheckboxListProps {
  options: { value: string; label: string }[];
  legend: string;
  name: string;
  required?: boolean;
}

export const CheckboxList = ({ options, legend, name, required }: CheckboxListProps) => {
  const { errors = {} } = useFormContext();

  return (
    <fieldset>
      <Legend>{legend}</Legend>
      {options.map(({ value, label }) => (
        <CheckboxField
          key={value}
          value={value}
          label={label}
          name={name}
          required={required}
          helperText={null}
        />
      ))}
      {errors[name] && <ErrorLabel>{errors[name].message}</ErrorLabel>}
    </fieldset>
  );
};
