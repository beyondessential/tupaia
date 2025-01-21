import React from 'react';
import styled from 'styled-components';
import { Search } from '@material-ui/icons';
import { InputAdornment } from '@material-ui/core';
import { AutocompleteInputChangeReason } from '@material-ui/lab/useAutocomplete';
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

const SearchAdornment = styled(InputAdornment)`
  margin-inline-start: 1rem;
  margin-inline-end: -1rem;
`;

const PopperComponent = ({ children }) => {
  return <>{children}</>;
};

export const MobileAutocomplete = ({
  options,
  isLoading,
  onChange,
  value,
  searchValue,
  setSearchValue,
}) => {
  const onChangeValue = (_e, newSelection: any | null) => {
    if (newSelection) {
      onChange(newSelection);
    }
  };

  return (
    <Container>
      <Autocomplete
        value={value}
        onChange={onChangeValue}
        /* @ts-ignore - ts fails to infer the reason prop from mui autocomplete */
        onInputChange={(
          e: React.ChangeEvent<{}>,
          newValue: string,
          reason: AutocompleteInputChangeReason,
        ) => {
          if (!e) return;
          if (reason === 'input') {
            setSearchValue(newValue);
          }
        }}
        inputValue={searchValue}
        getOptionLabel={option => (option ? option.label : '')}
        getOptionSelected={(option, selected) => option.id === selected?.id}
        placeholder="Search..."
        options={options}
        loading={isLoading}
        textFieldProps={{
          InputProps: {
            startAdornment: (
              <SearchAdornment position="start">
                <Search />
              </SearchAdornment>
            ),
          },
        }}
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
