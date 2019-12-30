/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ERROR } from '../../../styles';

const FieldError = styled.div`
  color: ${ERROR};
  text-align: left;
  font-size: 13px;
  display: flex;
  flex-direction: column;
`;

export const FieldErrors = ({ errors }) => (
  <FieldError>
    {errors.map(error => (
      <span key={error}>{error}</span>
    ))}
  </FieldError>
);

FieldErrors.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string),
};

FieldErrors.defaultProps = {
  errors: [],
};
