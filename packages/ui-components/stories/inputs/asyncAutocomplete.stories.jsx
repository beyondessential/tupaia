import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { AsyncAutocomplete } from '../../src/components';

export default {
  title: 'Inputs/AsyncAutocomplete',
};

const Container = styled.div`
  max-width: 400px;
  padding: 2rem;
`;

function sleep(delay = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

/*
 * Mock api service layer. For demo purposes.
 */
const api = () => {
  const fetchData = async query => {
    const response = await fetch(`https://swapi.dev/api/people/?search=${query}`);
    await sleep(500); // For demoing loading state
    const data = await response.json();
    return data.results.map(option => option.name);
  };

  return {
    get: fetchData,
  };
};

export const Simple = () => {
  return (
    <Container>
      <AsyncAutocomplete
        id="simple-autocomplete"
        label="Async Auto Complete"
        fetchOptions={api().get}
        placeholder="Search..."
      />
    </Container>
  );
};

export const Disabled = () => {
  return (
    <Container>
      <AsyncAutocomplete
        label="Simple Auto Complete"
        fetchOptions={api().get}
        placeholder="Search..."
        disabled
      />
    </Container>
  );
};

export const NoLabel = () => {
  return (
    <Container>
      <AsyncAutocomplete fetchOptions={api().get} placeholder="Search..." />
    </Container>
  );
};

export const HelperText = () => {
  return (
    <Container>
      <AsyncAutocomplete
        label="Helper Text Example"
        fetchOptions={api().get}
        placeholder="Search..."
        helperText="This field is required"
        required
      />
    </Container>
  );
};

export const Error = () => {
  return (
    <Container>
      <AsyncAutocomplete
        label="Simple Auto Complete"
        fetchOptions={api().get}
        placeholder="Search..."
        helperText="Please try again!"
        error
      />
    </Container>
  );
};

export const Controlled = () => {
  const [value, setValue] = useState(null);

  const handleChange = useCallback(
    (event, newValue) => {
      setValue(newValue);
    },
    [setValue],
  );

  return (
    <Container>
      <AsyncAutocomplete
        label="Async Auto Complete"
        onChange={handleChange}
        value={value}
        fetchOptions={api().get}
        placeholder="Search..."
      />
      <Typography>Selected Value: {value ? value.name : 'none'}</Typography>
    </Container>
  );
};

export const MuiProps = () => {
  return (
    <Container>
      <AsyncAutocomplete
        label="Mui Props Example"
        fetchOptions={api().get}
        placeholder="Search..."
        helperText="Type free text or select an option"
        muiProps={{
          freeSolo: true,
        }}
      />
    </Container>
  );
};
