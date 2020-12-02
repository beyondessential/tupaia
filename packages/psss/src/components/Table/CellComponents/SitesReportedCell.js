/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Tooltip } from '@tupaia/ui-components';

const DottedUnderline = styled.div`
  display: inline-block;
  border-bottom: 1px dotted ${props => props.theme.palette.text.secondary};
`;

// Todo: update placeholder title
export const SitesReportedCell = data => (
  <Tooltip title="Submitted: 1 day ago">
    <DottedUnderline>{`${data['Sites Reported']}/${data['Sites']}`}</DottedUnderline>
  </Tooltip>
);
