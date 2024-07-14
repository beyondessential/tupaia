/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Check } from '@material-ui/icons';
import { Autocomplete as BaseAutocomplete } from '@tupaia/ui-components';
import { Paper } from '@material-ui/core';

const OptionWrapper = styled.div`
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
  padding-left: 0.425rem;
  padding-right: 0.425rem;
  margin-left: 0.45rem;
  margin-right: 0.45rem;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.palette.primary.main};
  .MuiSvgIcon-root {
    font-size: 1.2rem;
  }
`;

const DisplayOption = ({ option, state }) => {
  const { selected } = state;
  const label = typeof option === 'string' ? option : option.label || option.value;

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
    ...(props.muiProps || {}),
    renderOption: props.muiProps.renderOption
      ? props.muiProps.renderOption
      : (option, state) => <DisplayOption option={option} state={state} />,
    PaperComponent: StyledPaper,
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
