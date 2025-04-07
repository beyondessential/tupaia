import React, { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';
import { Search as SearchIcon } from '@material-ui/icons';
import { InputAdornment } from '@material-ui/core';
import { AutocompleteInputChangeReason } from '@material-ui/lab/useAutocomplete';

import { Autocomplete } from '../../../components';

const Container = styled.div`
  block-size: 100%;
  border-radius: 0.1875rem;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  row-gap: 0.5rem;

  overflow-y: auto; // Fallback
  overflow-block: auto;

  &,
  .MuiOutlinedInput-notchedOutline {
    border: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  }
`;

const StyledPopper = styled.div`
  flex: 1;
  z-index: unset;

  .MuiAutocomplete-paper {
    border: none;
  }

  .MuiAutocomplete-listbox {
    max-height: unset;
    padding: 0;
  }
`;

const SearchAdornment = styled(InputAdornment)`
  margin-inline-start: 1rem;
  margin-inline-end: -1rem;
`;

interface TaskAutocompleteOption {
  id: string;
  label: string;
  value: string;
}

interface MobileAutocompleteProps {
  isLoading: boolean;
  onChange?: (event: React.ChangeEvent<{}>, value: any) => void;
  options: {
    id: string;
    label: string;
    value: string;
  }[];
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  value: any;
}

export const MobileAutocomplete = ({
  isLoading,
  onChange,
  options,
  searchValue,
  setSearchValue,
  value,
}: MobileAutocompleteProps) => {
  const onChangeValue = (event, newSelection) => {
    if (newSelection) {
      onChange?.(event, newSelection);
    }
  };

  return (
    <Container>
      <Autocomplete<TaskAutocompleteOption>
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
        options={options}
        loading={isLoading}
        textFieldProps={{
          InputProps: {
            startAdornment: (
              <SearchAdornment position="start">
                <SearchIcon />
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
          PopperComponent: StyledPopper,
        }}
      />
    </Container>
  );
};
