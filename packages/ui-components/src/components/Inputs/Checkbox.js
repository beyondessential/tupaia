/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiCheckbox from '@material-ui/core/Checkbox';
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

export const Checkbox = ({ label, className, ...props }) => {
  if (label) {
    return (
      <Wrapper className={className}>
        <MuiFormControlLabel control={<StyledCheckbox {...props} />} label={label} />
      </Wrapper>
    );
  }

  return <StyledCheckbox className={className} {...props} />;
};

Checkbox.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
};

Checkbox.defaultProps = {
  label: null,
  className: null,
};
