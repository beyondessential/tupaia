/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Select as BaseSelect } from '@tupaia/ui-components';
import { Country } from '@tupaia/types';
import { Entity } from '../../types';

const Select = styled(BaseSelect)`
  width: 10rem;
  margin-bottom: 0;
  .MuiInputBase-input {
    font-size: 0.875rem;
    padding: 0.5rem 2.5rem 0.5rem 1rem;
  }
  .MuiSvgIcon-root {
    right: 0.5rem;
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.grey['400']};
    box-shadow: none;
  }
  ${({ theme }) => theme.breakpoints.down('sm')} {
    width: 100%;
  }
`;
const Pin = styled.img.attrs({
  src: '/tupaia-pin.svg',
  ['aria-hidden']: true, // this pin is not of any use to the screen reader, so hide from the screen reader
})`
  width: 1rem;
  height: auto;
  margin-right: 0.5rem;
`;
const CountrySelectWrapper = styled.div`
  display: flex;
  align-items: center;
`;

interface SurveyCountrySelectorProps {
  countries: Entity[];
  selectedCountry?: Country | null;
  onChangeCountry: (country: Entity | null) => void;
}

export const SurveyCountrySelector = ({
  countries,
  selectedCountry,
  onChangeCountry,
}: SurveyCountrySelectorProps) => {
  const updateSelectedCountry = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeCountry(countries.find(country => country.code === e.target.value) || null);
  };
  return (
    <CountrySelectWrapper>
      <Pin />
      <Select
        options={countries?.map(country => ({ value: country.code, label: country.name })) || []}
        value={selectedCountry?.code}
        onChange={updateSelectedCountry}
        inputProps={{ 'aria-label': 'Select a country' }}
        placeholder="Select a country"
      />
    </CountrySelectWrapper>
  );
};
