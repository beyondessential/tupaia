import { Paper } from '@material-ui/core';
import { Check as CheckIcon } from '@material-ui/icons';
import React from 'react';
import styled from 'styled-components';

import {
  Autocomplete as UiAutocomplete,
  AutocompleteProps as UiAutocompleteProps,
} from '@tupaia/ui-components';

import { DESKTOP_BREAKPOINT } from '../constants';
import { InputHelperText } from './InputHelperText';

const PopupBody = styled(Paper).attrs({
  variant: 'outlined',
})`
  margin-block: 0;

  .MuiAutocomplete-option {
    align-items: center;
    border-color: transparent;
    border-radius: 0.1875rem;
    border-style: solid;
    border-width: max(0.0625rem, 1px);
    display: grid;
    grid-template-columns: minmax(min-content, 1fr) auto;
    inline-size: 100%;
    min-block-size: 2.5rem;
    padding-block: 0.5rem;
    padding-inline: 1.1rem; // Align with search input
    text-wrap: balance;

    &[aria-selected='true']:not([data-focus='true']) {
      background-color: transparent;
    }

    &[data-focus='true'] {
      background-color: ${props => props.theme.palette.primaryHover};
    }

    &[aria-selected='true'] {
      border-color: ${props => props.theme.palette.primary.main};
    }

    &[aria-disabled='true'] {
      opacity: 1;
    }
  }
`;

const SecondaryLabel = styled.span`
  border-inline-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.text.secondary};
  color: ${props => props.theme.palette.text.secondary};
  margin-inline: 1ch;
  padding-inline-start: 1ch;
`;

const checkIcon = <CheckIcon aria-hidden color="primary" style={{ fontSize: '1.2rem' }} />;

interface DisplayOptionProps {
  option:
    | string
    | {
        id: string;
        label?: React.ReactNode;
        secondaryLabel?: React.ReactNode;
        value: boolean | number | string;
      };
  state: {
    inputValue: string;
    selected?: boolean;
  };
}

const DisplayOption = ({ option, state }: DisplayOptionProps) => {
  const label =
    typeof option === 'string' ? (
      option
    ) : (
      // span only for layout, no semantics
      <span>
        {option.label ?? option.value}
        {option.secondaryLabel && <SecondaryLabel>{option.secondaryLabel}</SecondaryLabel>}
      </span>
    );

  return (
    <>
      {label}
      {state.selected && checkIcon}
    </>
  );
};

export const StyledBaseAutocomplete = styled(UiAutocomplete).attrs(props => ({
  muiProps: {
    renderOption: (option: DisplayOptionProps['option'], state: DisplayOptionProps['state']) => (
      <DisplayOption option={option} state={state} />
    ),
    PaperComponent: PopupBody,
    ...props.muiProps,
  },
}))`
  width: 100%;
  .MuiFormControl-root {
    margin-bottom: 0;
  }
  fieldset:disabled & .MuiAutocomplete-clearIndicator {
    display: none; // hide the clear button when disabled
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    box-shadow: none;
  }
`;
/**
 * Thin wrapper around {@link StyledBaseAutocomplete} to use its styling, but preserve generic
 * behaviour from the underlying component it styles.
 */
export const Autocomplete = <
  T = unknown,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
>(
  props: UiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
) => (
  <StyledBaseAutocomplete as={UiAutocomplete<T, Multiple, DisableClearable, FreeSolo>} {...props} />
);

const StyledAutocomplete = styled(Autocomplete).attrs(props => ({
  textFieldProps: {
    FormHelperTextProps: {
      component: InputHelperText,
    },
  },
  muiProps: {
    renderOption: (option: DisplayOptionProps['option'], state: DisplayOptionProps['state']) => (
      <DisplayOption option={option} state={state} />
    ),
    PaperComponent: PopupBody,
    ...props.muiProps,
  },
  placeholder: 'Search…',
}))`
  .MuiFormLabel-root {
    font-size: 0.875rem;
    line-height: 1.2;
    @media (min-width: ${DESKTOP_BREAKPOINT}) {
      font-size: 1rem;
    }
  }
  .MuiOutlinedInput-notchedOutline {
    border: none;
  }

  .MuiInputBase-root {
    background: transparent;
    max-width: 25rem;
    border-bottom: 1px solid ${({ theme }) => theme.palette.text.secondary};
    border-radius: 0;
    order: 2; // make the helper text appear above the input
    &.Mui-focused {
      border-bottom-color: ${({ theme }) => theme.palette.primary.main};
    }
  }

  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border: none;
  }
  .MuiInputBase-input.MuiAutocomplete-input.MuiInputBase-inputAdornedEnd {
    padding: 0.6rem 0;
    font-size: 0.875rem;
  }

  .MuiAutocomplete-inputRoot .MuiAutocomplete-endAdornment {
    right: 0;
  }
  .MuiIconButton-root {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

/**
 * Thin wrapper around {@link StyledAutocomplete} to use its styling, but preserve generic behaviour
 * from the underlying component it styles.
 */
export const QuestionAutocomplete = <
  T = unknown,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
>(
  props: UiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
) => <StyledAutocomplete as={UiAutocomplete<T, Multiple, DisableClearable, FreeSolo>} {...props} />;
