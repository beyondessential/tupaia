/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { useParams } from 'react-router';
import { useEntity, useUser } from '../../api/queries';
import { RouterButton } from '../../components';
import { MODAL_ROUTES } from '../../constants';

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

const RequestAccessButton = styled(RouterButton).attrs({
  variant: 'outlined',
  color: 'default',
})`
  margin-top: 1rem;
  text-transform: none;
`;

export const NoAccessDashboard = () => {
  const { entityCode } = useParams();
  const { isLoggedIn } = useUser();
  const { data: entity } = useEntity(entityCode);
  if (!entity) return null;
  const { type = '' } = entity;
  const displayType = type?.toLowerCase();
  const isProject = displayType === 'project';
  const LINK = {
    MODAL: isLoggedIn ? MODAL_ROUTES.REQUEST_COUNTRY_ACCESS : MODAL_ROUTES.LOGIN,
    TEXT: isLoggedIn ? 'Request Access' : 'Login',
  };
  return (
    <>
      <Text>
        You do not currently have access to view project data{' '}
        {isProject ? 'at the project level view' : `for the selected ${displayType}`}
      </Text>
      <Text>
        {isLoggedIn && ' If you believe you should be granted access to view this data, you may '}
        <RequestAccessButton modal={LINK.MODAL}>{LINK.TEXT}</RequestAccessButton>
      </Text>
    </>
  );
};
