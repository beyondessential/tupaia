/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import { CheckboxField } from '.';
import { Typography } from '@material-ui/core';

const Fieldset = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
`;

const Legend = styled.legend`
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const Error = styled(Typography).attrs({
  color: 'error',
})`
  text-align: left;
  margin-bottom: 0.5rem;
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
    <Fieldset>
      <Legend>{legend}</Legend>
      {options.map(({ value, label }) => (
        <CheckboxField
          key={value}
          value={value}
          label={label}
          name={name}
          required={required}
          isArray
        />
      ))}
      {errors[name] && <Error>{errors[name].message}</Error>}
    </Fieldset>
  );
};
