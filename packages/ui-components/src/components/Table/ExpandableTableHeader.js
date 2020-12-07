/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { TableHeader } from './TableHeader';

const StyledTableHeader = styled(TableHeader)`
  th:last-child,
  td:last-child {
    padding-right: 65px;
  }
`;

export const ExpandableTableHeader = props => <StyledTableHeader {...props} />;
