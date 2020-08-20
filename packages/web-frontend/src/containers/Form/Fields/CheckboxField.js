/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiCheckbox from '@material-ui/core/Checkbox';
import { PRIMARY_BLUE, WHITE } from '../../../styles';
import { FieldErrors } from '../common/FieldErrors';

const Container = styled.div`
  text-align: left;
  grid-column: ${({ fullWidth }) => fullWidth && '1 / -1'};

  > span {
    margin: 0;
    padding: 0 10px 0 0;
  }

  .MuiCheckbox-colorSecondary.Mui-checked {
    color: ${PRIMARY_BLUE};
  }
`;

const Content = styled.div`
  display: flex;

  .MuiCheckbox-root {
    padding: 5px 5px 5px 0;

    :hover {
      background-color: transparent;
    }
  }
`;

const Label = styled.label`
  cursor: pointer;
  align-self: center;
  color: ${WHITE};
`;

const CheckboxError = styled(FieldErrors)`
  margin-left: 42px;
`;

export const CheckboxField = ({ name, label, fullWidth, errors, validators, ...checkboxProps }) => {
  return (
    <Container fullWidth={fullWidth} name={name} validators={validators}>
      <Content>
        <MuiCheckbox inputProps={{ id: name }} length={label.length} {...checkboxProps} />
        <Label htmlFor={name}>{label}</Label>
      </Content>
      <CheckboxError errors={errors} />
    </Container>
  );
};

CheckboxField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  validators: PropTypes.arrayOf(PropTypes.object),
  errors: PropTypes.arrayOf(PropTypes.string),
  fullWidth: PropTypes.bool,
};

CheckboxField.defaultProps = {
  errors: [],
  validators: [],
  fullWidth: false,
};
