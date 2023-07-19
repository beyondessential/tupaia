/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { useParams } from 'react-router';
import { useEntity } from '../api/queries';

const Text = styled(Typography)`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  text-align: center;
  margin: 0.3rem 0 1rem 0;
  line-height: 1.4;
  & + & {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

export const NoDataAtLevelDashboard = () => {
  const { entityCode } = useParams();
  const { data: entity } = useEntity(entityCode);
  if (!entity) return null;
  const { type = '' } = entity;
  const displayType = type?.toLowerCase();
  const isProject = displayType === 'project';
  return (
    <>
      <Text>
        You do not currently have access to view project data
        {isProject ? 'at the project level view' : ` for the selected ${displayType}`}
      </Text>
      <Text>
        If you expected to see data displayed in this view, please contact the project coordinators
        for a timeline on these data being made available.
      </Text>
    </>
  );
};
