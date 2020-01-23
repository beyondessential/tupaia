/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { BREWER_PALETTE } from '../../../styles';

const Success = styled.div`
  color: ${BREWER_PALETTE.green};
  grid-column: 1 / -1;
  text-align: left;
`;

export const FormSuccess = ({ message }) => <Success>{message}</Success>;

FormSuccess.propTypes = {
  message: PropTypes.string,
};

FormSuccess.defaultProps = {
  message: '',
};
