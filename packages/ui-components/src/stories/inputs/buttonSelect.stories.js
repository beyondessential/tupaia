/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { ButtonSelect } from '../../components/Inputs/ButtonSelect';

export default {
  title: 'Inputs/ButtonSelect',
};

const options = [
  { name: 'Afghanistan', id: 'AF' },
  { name: 'Albania', id: 'AL' },
  { name: 'Algeria', id: 'DZ' },
  { name: 'Angola', id: 'AO' },
  { name: 'Anguilla', id: 'AI' },
  { name: 'Antarctica', id: 'AQ' },
  { name: 'Argentina', id: 'AR' },
  { name: 'Armenia', id: 'AM' },
  { name: 'Aruba', id: 'AW' },
  { name: 'Australia', id: 'AU' },
  { name: 'Austria', id: 'AT' },
  { name: 'Azerbaijan', id: 'AZ' },
  { name: 'Bahamas', id: 'BS' },
  { name: 'Bahrain', id: 'BH' },
  { name: 'Bangladesh', id: 'BD' },
  { name: 'Barbados', id: 'BB' },
  { name: 'Belarus', id: 'BY' },
  { name: 'Belgium', id: 'BE' },
  { name: 'Belize', id: 'BZ' },
  { name: 'Benin', id: 'BJ' },
  { name: 'Bermuda', id: 'BM' },
  { name: 'Bhutan', id: 'BT' },
  { name: 'Bolivia', id: 'BO' },
  { name: 'Botswana', id: 'BW' },
  { name: 'Brazil', id: 'BR' },
  { name: 'Bulgaria', id: 'BG' },
  { name: 'Burundi', id: 'BI' },
  { name: 'Cambodia', id: 'KH' },
  { name: 'Cameroon', id: 'CM' },
  { name: 'Canada', id: 'CA' },
];

const Container = styled(MuiBox)`
  max-width: 500px;
  padding: 1rem;
`;

export const simple = () => (
  <Container>
    <ButtonSelect id="button-select" label="Button Select Field" options={options} />
  </Container>
);

export const disabled = () => (
  <Container>
    <ButtonSelect id="button-select" label="Button Select Field" options={options} disabled />
  </Container>
);

export const muiProps = () => (
  <Container>
    <ButtonSelect
      id="button-select"
      label="Button Select Field"
      options={options}
      muiProps={{ error: true }}
    />
  </Container>
);

export const controlled = () => {
  const [controlValue, setControlValue] = useState(options[4].id);

  const handleChange = useCallback(
    newValue => {
      setControlValue(newValue);
    },
    [setControlValue],
  );

  const selectedOption = options.find(option => option.id === controlValue);

  return (
    <Container>
      <ButtonSelect
        id="button-select"
        label="Button Select Field"
        options={options}
        onChange={handleChange}
        controlValue={controlValue}
      />
      <Typography>Selected Value: {selectedOption ? selectedOption.name : 'none'}</Typography>
    </Container>
  );
};
