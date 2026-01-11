import React, { ChangeEventHandler, ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

import { Select as BaseSelect } from '@tupaia/ui-components';

import { FullScreenSelect } from '../../components/FullScreenSelect';
import { useIsMobile } from '../../utils';
import type { UserCountriesType } from './useUserCountries';

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
    border-color: ${props => props.theme.palette.grey[400]};
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

/** @privateRemarks Forwards props to <img> because <picture> is set to `display: contents`. */
const Pin = (props: ComponentPropsWithoutRef<typeof Img>) => (
  <Picture aria-hidden>
    <source src="/datatrak-pin.svg" type="image/svg+xml" />
    <Img aria-hidden src="/datatrak-pin.svg" width={24} height={24} {...props} />
  </Picture>
);

export interface CountrySelectorProps
  extends Pick<UserCountriesType, 'countries' | 'selectedCountry'>,
    Omit<ComponentPropsWithoutRef<typeof CountrySelectWrapper>, 'onChange'> {
  onChange: ChangeEventHandler<HTMLSelectElement>;
}

export const CountrySelector = ({ countries, selectedCountry, onChange }: CountrySelectorProps) => {
  const options = countries.map(country => ({
    value: country.code,
    label: country.name,
  }));

  const commonProps = {
    onChange,
    options,
    value: selectedCountry?.code,
  };

  return (
    <CountrySelectWrapper>
      {useIsMobile() ? (
        <FullScreenSelect {...commonProps} icon={<Pin />} label="Select country" />
      ) : (
        <>
          <Pin style={{ marginInlineEnd: '0.25rem' }} />
          <Select
            {...commonProps}
            placeholder="Select country"
            SelectProps={{
              'aria-label': 'Select country',
            }}
          />
        </>
      )}
    </CountrySelectWrapper>
  );
};
