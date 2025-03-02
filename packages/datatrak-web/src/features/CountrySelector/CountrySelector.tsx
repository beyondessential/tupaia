import React, { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

import { Select as BaseSelect } from '@tupaia/ui-components';

import { FullScreenSelect } from '../../components/FullScreenSelect';
import { useIsMobile } from '../../utils';
import { useUserCountries } from './useUserCountries';

const Select = styled(BaseSelect)`
  inline-size: 10rem;

  &.MuiFormControl-root {
    margin-block-end: 0;
  }
  .MuiInputBase-input.MuiSelect-selectMenu {
    font-size: 0.875rem;
    padding-block: 0.5rem;
    padding-inline: 1rem 2.5rem;
  }
  .MuiSvgIcon-root {
    inset-inline-end: 0.5rem;
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.grey['400']};
    box-shadow: none;
  }
`;

export const CountrySelectWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Picture = styled.picture`
  aspect-ratio: 1;
  block-size: 1.5rem;
  object-fit: contain;
  object-position: center;
`;
const Img = styled.img`
  block-size: 1.5rem;
  inline-size: auto;
`;
const Pin = (props: ComponentPropsWithoutRef<typeof Picture>) => (
  <Picture aria-hidden {...props}>
    <source srcSet="/tupaia-pin.svg" />
    <Img aria-hidden src="/tupaia-pin.svg" width={24} height={24} />
  </Picture>
);

const StyledPin = styled(Pin)`
  margin-inline-end: 0.5rem;
`;

export const CountrySelector = () => {
  const { countries, selectedCountry, updateSelectedCountry } = useUserCountries();

  const options = countries.map(country => ({
    value: country.code,
    label: country.name,
  }));

  const commonProps = {
    onChange: updateSelectedCountry,
    options,
    value: selectedCountry?.code,
  };

  return (
    <CountrySelectWrapper>
      {useIsMobile() ? (
        <FullScreenSelect {...commonProps} icon={<Pin />} label="Select country" />
      ) : (
        <>
          <StyledPin />
          <Select
            {...commonProps}
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
