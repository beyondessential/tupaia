/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTextField from '@material-ui/core/TextField';
import { FieldErrors } from '../common/FieldErrors';

const Container = styled.div`
  grid-column: ${({ fullWidth }) => fullWidth && '1 / -1'};
`;

export const TextField = ({ errors, id, name, fullWidth, validators, ...fieldProps }) => (
  <Container name={name} fullWidth={fullWidth} validators={validators}>
    <MuiTextField id={id} name={name} error={errors.length > 0} fullWidth {...fieldProps} />
    <FieldErrors errors={errors} />
  </Container>
);

TextField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  validators: PropTypes.arrayOf(PropTypes.object),
  errors: PropTypes.arrayOf(PropTypes.string),
  fullWidth: PropTypes.bool,
};

TextField.defaultProps = {
  id: undefined,
  errors: [],
  validators: [],
  fullWidth: false,
};
