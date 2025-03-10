import React from 'react';
import styled from 'styled-components';
import { Select as BaseSelect } from '@tupaia/ui-components';
import { Country } from '@tupaia/types';
import { Entity } from '../../types';

const Select = styled(BaseSelect)`
  width: 10rem;

  &.MuiFormControl-root {
    margin-bottom: 0;
  }
  .MuiInputBase-input.MuiSelect-selectMenu {
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
  'aria-hidden': true, // this pin is not of any use to the screen reader, so hide from the screen reader
})`
  width: 1rem;
  height: auto;
  margin-right: 0.5rem;
`;

export const CountrySelectWrapper = styled.div`
  display: flex;
  align-items: center;
`;

interface CountrySelectorProps {
  countries: Entity[];
  selectedCountry?: Country | null;
  onChangeCountry: (country: Entity | null) => void;
}

export const CountrySelector = ({
  countries,
  selectedCountry,
  onChangeCountry,
}: CountrySelectorProps) => {
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
        placeholder="Select a country"
        SelectProps={{
          'aria-label': 'Select a country',
        }}
      />
    </CountrySelectWrapper>
  );
};
