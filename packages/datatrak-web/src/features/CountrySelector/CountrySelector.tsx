import React from 'react';
import styled from 'styled-components';

import { Select as BaseSelect } from '@tupaia/ui-components';

import { useUserCountries } from '.';
import { FullScreenSelect } from '../../components/FullScreenSelect';
import { useIsMobile } from '../../utils';

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
  'aria-hidden': true,
  src: '/tupaia-pin.svg',
})`
  width: 1.5rem;
  height: auto;
  margin-right: 0.5rem;
`;

export const CountrySelectWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const CountrySelector = () => {
  const { countries, selectedCountry, updateSelectedCountry: onChangeCountry } = useUserCountries();
  const updateSelectedCountry = e => {
    onChangeCountry(countries.find(country => country.code === e.target.value) ?? null);
  };

  const options =
    countries?.map(country => ({
      value: country.code,
      label: country.name,
    })) ?? [];

  return (
    <CountrySelectWrapper>
      {useIsMobile() ? (
        <FullScreenSelect
          label="Select country"
          onChange={updateSelectedCountry}
          options={options}
          value={selectedCountry?.code}
        />
      ) : (
        <>
          <Pin />
          <Select
            options={options}
            value={selectedCountry?.code}
            onChange={updateSelectedCountry}
            placeholder="Select a country"
            SelectProps={{
              'aria-label': 'Select a country',
            }}
          />
        </>
      )}
    </CountrySelectWrapper>
  );
};
