/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import EditIcon from 'material-ui/svg-icons/action/info';

const EditButton = styled.div`
  outline: 1px solid yellow;
`;

export const DashboardEditButton = ({ onEdit }) => (
  <EditButton onClick={onEdit} role="button" tabIndex={0}>
    edit dashboard
    <EditIcon />
  </EditButton>
);

DashboardEditButton.propTypes = {
  onEdit: PropTypes.func.isRequired,
};
