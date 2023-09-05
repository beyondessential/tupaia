/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { TextField } from '@material-ui/core';

const Wrapper = styled.div`
  display: flex;
`;

const LatField = styled(TextField)`
  width: 5.875rem;
  margin: 1.5rem;
  border-bottom: 1px solid #333333;
  .MuiFormLabel-root {
    color: #333333;
    font-size: 1rem;
    font-weight: 800;
  }

  .MuiInput-underline:before,
  .MuiInput-underline:after {
    display: none;
  }
`;

const LongField = styled(TextField)`
  width: 5.875rem;
  margin: 1.5rem;
  border-bottom: 1px solid #333333;
  .MuiFormLabel-root {
    color: #333333;
    font-size: 1rem;
    font-weight: 800;
  }

  .MuiInput-underline:before,
  .MuiInput-underline:after {
    display: none;
  }
`;

export const LatLongFields = ({ setGeolocation, geolocation }: any) => {
  const handleChange = (event: any) => {
    const value = event.target.value;
    setGeolocation({
      ...geolocation,
      [event.target.name]: parseFloat(value),
    });
  };
  console.log(geolocation);
  return (
    <Wrapper>
      <LatField
        InputLabelProps={{ shrink: true }}
        id="standard-basic"
        name="latitude"
        value={geolocation.latitude || null}
        label="Latitude"
        onChange={handleChange}
      />
      <LongField
        InputLabelProps={{ shrink: true }}
        id="standard-basic"
        name="longitude"
        value={geolocation.longitude || null}
        label="Longitude"
        onChange={handleChange}
      />
    </Wrapper>
  );
};
