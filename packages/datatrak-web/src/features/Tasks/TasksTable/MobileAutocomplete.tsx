import React from 'react';
import styled from 'styled-components';
import { Search as SearchIcon } from '@material-ui/icons';
import { InputAdornment } from '@material-ui/core';
import { AutocompleteInputChangeReason } from '@material-ui/lab/useAutocomplete';
import { Autocomplete } from '../../../components';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-inline: 1rem;
  padding-block: 1rem;
  border-radius: 3px;

  &,
  .MuiOutlinedInput-notchedOutline {
    border: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  }

  .MuiPaper-root {
    border: none;
  }
`;

const SearchAdornment = styled(InputAdornment)`
  margin-inline-start: 1rem;
  margin-inline-end: -1rem;
`;

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
        placeholder="Search…"
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
          PopperComponent: React.Fragment,
        }}
      />
    </Container>
  );
};
