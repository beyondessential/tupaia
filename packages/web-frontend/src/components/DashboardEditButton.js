/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiIconButton from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';

const EditButton = styled(MuiIconButton)`
  font-size: 10px;
  margin: 5px 5px 0px 10px;
  background-color: transparent;
  color: white;
`;

export const DashboardEditButton = ({ onClick }) => (
  <EditButton
    startIcon={<EditIcon style={{ fontSize: 16 }} />}
    variant="outlined"
    disableElevation
    onClick={onClick}
    tabIndex={0}
  >
    Edit
  </EditButton>
);

DashboardEditButton.propTypes = {
  onEdit: PropTypes.func.isRequired,
};
