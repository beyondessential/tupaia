/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiCheckbox from '@material-ui/core/Checkbox';
import MuiFormHelperText from '@material-ui/core/FormHelperText';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import styled from 'styled-components';
import PropTypes from 'prop-types';

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

export const Checkbox = ({ label, helperText, error, className, ...props }) => {
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

Checkbox.propTypes = {
  label: PropTypes.string,
  error: PropTypes.bool,
  className: PropTypes.string,
  helperText: PropTypes.string,
};

Checkbox.defaultProps = {
  error: false,
  label: null,
  className: null,
  helperText: null,
};
