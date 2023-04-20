import React from 'react';
import { FormHelperText } from '@material-ui/core';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from './TextField';

const HexcodeFieldWrapper = styled.div`
  margin-bottom: 1em;
`;

const HexcodeFieldContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 1em;
`;

const HexcodePreview = styled.div`
  background-color: ${({ backgroundColor }) => backgroundColor};
  height: 100%;
  width: 100%;
  border-radius: 50%;
  width: 3em;
  height: 3em;
  margin-left: 1em;
  margin-bottom: 0.2em;
  border: ${({ theme }) => `1px solid ${theme.palette.common.black}`};
`;

const HexInput = styled(TextField)`
  max-width: 18em;
  margin-bottom: 0;
`;

const HEXCODE_PATTERN = /^#([0-9A-F]{3}){1,2}$/i;

export const HexcodeField = ({ value, onChange, label, helperText, id, disabled }) => {
  const handleChangeValue = event => {
    onChange(event.target.value);
  };
  const getIsValidHexCode = () => {
    // validate the input against standard hexcode pattern
    if (!value) return false;
    return value.match(HEXCODE_PATTERN);
  };
  return (
    <HexcodeFieldWrapper>
      <HexcodeFieldContainer>
        <HexInput
          label={label}
          value={value}
          id={id}
          onChange={handleChangeValue}
          disabled={disabled}
          inputProps={{
            'aria-describedby': helperText ? `${id}-helper-text` : null,
            pattern: HEXCODE_PATTERN,
          }}
        />
        {getIsValidHexCode() && (
          <HexcodePreview backgroundColor={value} aria-label={`Colour preview for ${label}`} />
        )}
      </HexcodeFieldContainer>
      {helperText && <FormHelperText id={`${id}-helper-text`}>{helperText}</FormHelperText>}
    </HexcodeFieldWrapper>
  );
};

HexcodeField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  helperText: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
};

HexcodeField.defaultProps = {
  value: '',
  onChange: () => {},
  label: '',
  helperText: '',
  id: '',
  disabled: false,
};
