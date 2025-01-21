import React from 'react';
import styled from 'styled-components';
import { Check } from '@material-ui/icons';
import { Autocomplete as BaseAutocomplete } from '@tupaia/ui-components';
import { Paper } from '@material-ui/core';
import { DESKTOP_BREAKPOINT } from '../constants';
import { InputHelperText } from './InputHelperText';

const OptionWrapper = styled.div`
  display: block;
  flex: 1;
  height: 100%;
  width: 100%;
  padding: 0.2rem 0.875rem;
  line-height: 1.2;
  margin: 0.3rem 0;
`;

const StyledPaper = styled(Paper).attrs({
  variant: 'outlined',
})`
  border-color: ${({ theme }) => theme.palette.primary.main};
  .MuiAutocomplete-option {
    padding: 0;
    &:hover,
    &[data-focus='true'] {
      background-color: ${({ theme }) => theme.palette.primaryHover};
    }
    &[aria-selected='true'] {
      background-color: transparent;
    }
    &[aria-disabled='true'] {
      opacity: 1;
    }
  }
`;

const SelectedOption = styled(OptionWrapper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 0.425rem;
  margin-inline: 0.45rem;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.palette.primary.main};
  .MuiSvgIcon-root {
    font-size: 1.2rem;
  }
`;

const Label = styled.span`
  font-style: ${props => props.theme.typography.fontWeightBold};
  color: ${props => props.theme.palette.text.primary};
`;

const Code = styled.span`
  margin-inline: 0.45rem;
  padding-left: 0.45rem;
  border-left: 1px solid ${props => props.theme.palette.text.secondary};
  color: ${props => props.theme.palette.text.secondary};
  flex: 1;
`;

const DisplayOption = ({ option, state }) => {
  const { selected } = state;
  const label =
    typeof option === 'string' ? (
      option
    ) : (
      <>
        <Label>{option.label || option.value}</Label>
        {option.secondaryLabel ? <Code>{option.secondaryLabel}</Code> : null}
      </>
    );

  if (selected)
    return (
      <SelectedOption>
        {label}
        <Check color="primary" />
      </SelectedOption>
    );
  return <OptionWrapper>{label}</OptionWrapper>;
};

export const Autocomplete = styled(BaseAutocomplete).attrs(props => ({
  muiProps: {
    renderOption: (option, state) => <DisplayOption option={option} state={state} />,
    PaperComponent: StyledPaper,
    ...(props.muiProps || {}),
  },
}))`
  width: 100%;
  .MuiFormControl-root {
    margin-bottom: 0;
  }
  fieldset:disabled & {
    .MuiAutocomplete-clearIndicator {
      display: none; // hide the clear button when disabled
    }
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    box-shadow: none;
  }
`;

export const QuestionAutocomplete = styled(Autocomplete).attrs({
  textFieldProps: {
    FormHelperTextProps: {
      component: InputHelperText,
    },
  },
  placeholder: 'Search..',
})`
  .MuiFormControl-root {
    margin-bottom: 0;
  }

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
