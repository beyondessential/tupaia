/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiCheckbox, { CheckboxProps as MuiCheckboxProps } from '@material-ui/core/Checkbox';
import MuiFormHelperText from '@material-ui/core/FormHelperText';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import styled from 'styled-components'; 

const StyledCheckbox = styled(MuiCheckbox)`
  &.MuiButtonBase-root:not(.MuiIconButton-colorPrimary) {
    color: ${props => props.theme.palette.text.primary};
  }

  &.Mui-checked:not(.MuiIconButton-colorPrimary) {
    color: ${props => props.theme.palette.text.primary};
  }
`;

const Wrapper = styled.div`
  margin-top: -0.375rem;
  margin-bottom: 1.25rem;
`;

const FormHelperText = styled(MuiFormHelperText)`
  margin-top: -4px;
`;

interface CheckboxProps extends MuiCheckboxProps {
  label?: string;
  error?: boolean;
  className?: string;
  helperText?: string;
}

export const Checkbox = ({
  label,
  helperText,
  error = false,
  className,
  ...props
}: CheckboxProps) => {
  if (label) {
    return (
      <Wrapper className={className}>
        <MuiFormControlLabel control={<StyledCheckbox {...props} />} label={label} />
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
      </Wrapper>
    );
  }

  return <StyledCheckbox className={className} {...props} />;
};
