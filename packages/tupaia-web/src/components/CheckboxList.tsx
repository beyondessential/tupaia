/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { CheckboxField } from '.';

const CountryList = styled.fieldset`
  border: none;
  padding: 0;
`;

const Legend = styled.legend`
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

interface CheckboxListProps {
  options: { value: string; label: string }[];
  legend: string;
  name: string;
}

export const CheckboxList = ({ options, legend, name }: CheckboxListProps) => {
  return (
    <CountryList>
      <Legend>{legend}</Legend>
      {options.map(({ value, label }) => (
        <CheckboxField key={value} value={value} label={label} name={name} />
      ))}
    </CountryList>
  );
};
