import React from 'react';
import { FormHelperText } from '@material-ui/core';
import styled from 'styled-components';
import { TextField } from './TextField';

const HexcodeFieldContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 1em;
`;

const HexcodePreview = styled.div<any>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 50%;
  width: 3em;
  height: 3em;
  margin-left: 1em;
  margin-bottom: 0.2em;
  border: ${({ theme }) => `1px solid ${theme?.palette?.common?.black}`};
`;

const HexInput = styled(TextField)`
  margin-bottom: 0;
  width: calc(100% - 4em);
`;

const HEXCODE_PATTERN = /^#([0-9A-F]{3}){1,2}$/i;

interface HexcodeFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  helperText?: string;
  id?: string;
  disabled?: boolean;
  tooltip?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
}

export const HexcodeField = ({
  value,
  onChange = () => {},
  label,
  helperText,
  id,
  disabled,
  tooltip,
  placeholder,
  required,
  error,
}: HexcodeFieldProps) => {
  const handleChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const isValidHexCode = value ? value.match(HEXCODE_PATTERN) : false;
  return (
    <div>
      <HexcodeFieldContainer>
        <HexInput
          label={label}
          tooltip={tooltip}
          value={value}
          id={id}
          onChange={handleChangeValue}
          disabled={disabled}
          inputProps={{
            'aria-describedby': helperText ? `${id}-helper-text` : '',
            pattern: HEXCODE_PATTERN,
          }}
          placeholder={placeholder}
          required={required}
          error={error}
        />
        {isValidHexCode && (
          <HexcodePreview backgroundColor={value} aria-label={`Colour preview for ${label}`} />
        )}
      </HexcodeFieldContainer>
      {helperText && <FormHelperText id={`${id}-helper-text`}>{helperText}</FormHelperText>}
    </div>
  );
};
