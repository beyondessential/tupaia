/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Alert } from '../Alert';
import { BLUE } from '../../styles';
import { VIEW_CONTENT_SHAPE } from './propTypes';

const StyledAlert = styled(Alert)`
  &.MuiAlert-root {
    margin: 20px auto 10px;
    padding: 5px 16px 5px 13px;
  }
`;

export const PlainNoDataMessage = styled.p`
  color: ${BLUE};
  margin-top: 10px;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.8;
`;

export const NoDataMessage = ({ viewContent, severity, AlertComponent }) => {
  let message = 'No data';

  if (viewContent.noDataMessage) {
    message = viewContent.noDataMessage;
  } else if (viewContent.source === 'mSupply') {
    message = 'Requires mSupply';
  } else if (viewContent.startDate && viewContent.endDate) {
    message = `No data for ${viewContent.startDate} to ${viewContent.endDate}`;
  }

  return <AlertComponent severity={severity}>{message}</AlertComponent>;
};

NoDataMessage.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE).isRequired,
  severity: PropTypes.string,
  AlertComponent: PropTypes.elementType,
};

NoDataMessage.defaultProps = {
  AlertComponent: StyledAlert,
  severity: 'info',
};
