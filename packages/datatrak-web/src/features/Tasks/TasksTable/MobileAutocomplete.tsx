/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import React, { useState } from 'react';
import throttle from 'lodash.throttle';
import { Autocomplete } from '../../../components';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  padding: 1rem;

  .MuiPaper-root {
    border: none;
  }
`;

const PopperComponent = ({ children }) => {
  return <>{children}</>;
};

export const MobileAutocomplete = ({ options, isLoading, onChange }) => {
  const [selectedValue, setSelectedValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const onChangeValue = (_e, newSelection: any | null) => {
    if (newSelection) {
      console.log(newSelection);
      onChange(newSelection);
    }
  };

  return (
    <Container>
      <Autocomplete
        value={selectedValue}
        onChange={onChangeValue}
        onInputChange={throttle((e, newValue, reason) => {
          if (!e) return;
          if (reason === 'input') {
            setSearchValue(newValue);
          }
        }, 100)}
        inputValue={searchValue}
        getOptionLabel={option => option.label}
        getOptionSelected={(option, selected) => option.id === selected?.id}
        placeholder="Search..."
        options={options}
        isLoading={isLoading}
        muiProps={{
          open: true,
          disableCloseOnSelect: true,
          freeSolo: true,
          disableClearable: true,
          disablePortal: false,
          PopperComponent,
        }}
      />
    </Container>
  );
};
