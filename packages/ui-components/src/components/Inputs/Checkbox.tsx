import React, { ReactNode } from 'react';
import MuiCheckbox, { CheckboxProps as MuiCheckboxProps } from '@material-ui/core/Checkbox';
import MuiFormHelperText from '@material-ui/core/FormHelperText';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import styled from 'styled-components';
import { InputLabel } from './InputLabel';

const StyledCheckbox = styled(MuiCheckbox)`
  &:is(.MuiButtonBase-root, .Mui-checked):not(.MuiIconButton-colorPrimary) {
    color: ${props => props.theme.palette.text.primary};
  }
`;

const Wrapper = styled.div`
  margin-top: -0.375rem;
  margin-bottom: 1.25rem;
  .MuiFormControlLabel-label {
    display: flex;
    align-items: center;
    span + span {
      margin-left: 0.5rem;
    }
  }
`;

const FormHelperText = styled(MuiFormHelperText)`
  margin-top: -4px;
`;

interface CheckboxProps extends MuiCheckboxProps {
  label?: ReactNode;
  error?: boolean;
  helperText?: ReactNode;
  tooltip?: string;
}

export const Checkbox = ({
  label,
  helperText,
  error = false,
  className,
  tooltip,
  ...props
}: CheckboxProps) => {
  if (label) {
    return (
      <Wrapper className={className}>
        <MuiFormControlLabel
          control={<StyledCheckbox {...props} />}
          label={<InputLabel label={label} tooltip={tooltip} as="span" />}
        />
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
      </Wrapper>
    );
  }

  return <StyledCheckbox className={className} {...props} />;
};
