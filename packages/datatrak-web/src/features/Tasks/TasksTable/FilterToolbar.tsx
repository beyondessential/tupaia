/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { parse } from 'cookie';
import { useQueryClient } from 'react-query';
import {
  FormGroup as MuiFormGroup,
  FormControlLabel as MuiFormControlLabel,
  Checkbox as MuiCheckbox,
} from '@material-ui/core';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.3rem 0.3rem 0.2rem;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const FormGroup = styled(MuiFormGroup)`
  display: flex;
  flex-direction: row;
`;

const FormControlLabel = styled(MuiFormControlLabel)`
  .MuiFormControlLabel-label {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.palette.text.secondary};
  }

  .MuiCheckbox-root {
    padding-right: 3px;
  }
`;

const Checkbox = ({ name, value, label, onChange }) => {
  return (
    <FormControlLabel
      control={
        <MuiCheckbox checked={value} onChange={onChange} name={name} color="primary" size="small" />
      }
      label={label}
    />
  );
};

const setCookie = (cookieName: string, value: boolean) => {
  const date = new Date();
  date.setTime(date.getTime() + 24 * 60 * 60 * 1000); // 24 hours, in milliseconds
  const expires = 'expires=' + date.toUTCString();
  document.cookie = `${cookieName}=${value};${expires};path=/`;
};

const getCookie = (cookieName: string) => {
  // get the cookie
  const cname = `${cookieName}=`;
  const decodedCookie = decodeURIComponent(document.cookie);

  // split the cookie into an array

  const ca = decodedCookie.split(';');
  // return the value of the cookie if it exists, otherwise return undefined
  return (
    ca
      .find(cookie => cookie.trim().startsWith(cname))
      ?.trim()
      .substring(cname.length) === 'true'
  );
};

const getFilterValue = name => {
  return getCookie(name);
};

export const FilterToolbar = () => {
  const queryClient = useQueryClient();

  const handleChange = event => {
    const { name, checked: value } = event.target;
    console.log('CHANGE', name, value);
    queryClient.invalidateQueries('tasks');
    setCookie(name, value);
  };

  return (
    <Container>
      <FormGroup>
        <Checkbox
          name="all_assignees"
          label="Show all assignees"
          value={getFilterValue('all_assignees')}
          onChange={handleChange}
        />
        <Checkbox
          name="all_completed"
          label="Show completed tasks"
          value={getFilterValue('all_completed')}
          onChange={handleChange}
        />
        <Checkbox
          name="all_cancelled"
          label="Show cancelled tasks"
          value={getFilterValue('all_cancelled')}
          onChange={handleChange}
        />
      </FormGroup>
    </Container>
  );
};
