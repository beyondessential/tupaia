import React from 'react';
import MuiAutocomplete, {
  AutocompleteProps as MuiAutocompleteProps,
} from '@material-ui/lab/Autocomplete';
import { TextFieldProps } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import MuiKeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CircularProgress from '@material-ui/core/CircularProgress';
import styled from 'styled-components';
import { TextField } from './TextField';

const KeyboardArrowDown = styled(MuiKeyboardArrowDown)`
  font-size: 1.5rem;
`;

const StyledPaper = styled(Paper).attrs({ elevation: 0, variant: 'outlined' })`
  .MuiAutocomplete-option {
    padding-block: 0.6rem;
    padding-inline: 1.2rem;
  }
`;

const StyledAutocomplete = styled(MuiAutocomplete)`
  .MuiAutocomplete-inputRoot.MuiInputBase-adornedEnd.MuiOutlinedInput-adornedEnd {
    padding: 0 2.8rem 0 0;
  }

  .MuiInputBase-input.MuiAutocomplete-input.MuiInputBase-inputAdornedEnd {
    padding: 0.85rem 0.3rem 0.85rem 1.1rem;
  }

  .MuiAutocomplete-inputRoot .MuiAutocomplete-endAdornment {
    right: 0.9rem;
  }

  .MuiInputBase-root.Mui-error {
    background-color: transparent;

    &,
    &.Mui-focused {
      border-color: ${props => props.theme.palette.error.main};
    }
  }
`;

export interface BaseAutocompleteProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
  error?: boolean;
  getOptionSelected?: (option: T, value: any) => boolean;
  helperText?: string;
  id?: string;
  label?: React.ReactNode;
  placeholder?: TextFieldProps['placeholder'];
  required?: boolean;
  value?: any;

  /**
   * @deprecated
   * Prefer supplying props directly.
   *
   * @privateRemarks
   * Should actually `Partial<MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>>`, but
   * this breaks existing usages.
   */
  muiProps?: any;
}

/** Extends BaseAutocompleteProps but `renderInput` is optional. Forwards all type arguments. */
export interface AutocompleteProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends Omit<BaseAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'>,
    Partial<Pick<BaseAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'>> {
  options: T[];
  onInputChange?: (event: React.ChangeEvent<{}>, newValue: any) => void;
  inputValue?: any;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  name?: string;
  defaultValue?: any;
  tooltip?: string;
  textFieldProps?: TextFieldProps;
}

export const Autocomplete = <
  T = unknown,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
>({
  error = false,
  getOptionLabel,
  getOptionSelected,
  helperText,
  inputRef,
  inputValue,
  label = '',
  loading,
  muiProps,
  name,
  placeholder,
  required = false,
  textFieldProps,
  tooltip,
  ...props
}: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) => (
  <StyledAutocomplete
    // Ideally would just use `StyledAutocomplete<T, Multiple, DisableClearable, FreeSolo>` in the
    // line above, but styled-components struggles with generic components
    as={MuiAutocomplete<T, Multiple, DisableClearable, FreeSolo>}
    inputValue={inputValue}
    getOptionSelected={getOptionSelected}
    getOptionLabel={getOptionLabel}
    popupIcon={<KeyboardArrowDown />}
    PaperComponent={StyledPaper}
    blurOnSelect
    renderInput={params => (
      <TextField
        {...(params as any)}
        {...textFieldProps}
        label={label}
        tooltip={tooltip}
        name={name}
        placeholder={placeholder}
        error={error}
        required={required}
        helperText={helperText}
        inputRef={inputRef}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    )}
    {...muiProps}
    {...props}
  />
);
