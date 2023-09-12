/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { TextInput } from '../../../components';

const Wrapper = styled.div`
  display: flex;
  padding-bottom: 0.5rem;
  .MuiFormControlLabel-root {
    width: 6.3rem;
    &:first-child {
      margin-right: 1.125rem;
    }
  }
`;

export const LatLongFields = ({ setGeolocation, geolocation, name }: any) => {
  const handleChange = (e: ChangeEvent<{}>, field: string) => {
    setGeolocation({
      ...geolocation,
      [field]: parseFloat((e.target as HTMLInputElement).value),
      accuracy: 'N/A',
    });
  };
  return (
    <Wrapper>
      <TextInput
        id={`${name}-latitude`}
        name={`${name}-latitude`}
        value={geolocation?.latitude || ''}
        label="Latitude"
        onChange={(e: ChangeEvent<{}>) => handleChange(e, 'latitude')}
        textInputProps={{
          placeholder: 'e.g. 37.7',
          type: 'number',
          inputProps: {
            min: -90,
            max: 90,
          },
        }}
      />
      <TextInput
        id={`${name}-longitude`}
        name={`${name}-longitude`}
        value={geolocation?.longitude || ''}
        label="Longitude"
        onChange={(e: ChangeEvent<{}>) => handleChange(e, 'longitude')}
        textInputProps={{
          placeholder: 'e.g. -122.4',
          type: 'number',
          inputProps: {
            min: -180,
            max: 180,
          },
        }}
      />
    </Wrapper>
  );
};
