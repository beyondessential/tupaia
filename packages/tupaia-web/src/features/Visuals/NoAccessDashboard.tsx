import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { useLocation, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useEntity, useUser } from '../../api/queries';
import { RouterButton } from '../../components';
import { MODAL_ROUTES, URL_SEARCH_PARAMS } from '../../constants';

const Text = styled(Typography)`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  text-align: center;
  margin: 0.3rem 0 1rem 0;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
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
  const { projectCode, entityCode } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isLoggedIn } = useUser();
  const { data: entity } = useEntity(projectCode, entityCode);

  if (!entity) return null;
  const { type = '' } = entity;
  const displayType = type?.toLowerCase();
  const isProject = displayType === 'project';

  searchParams.set(URL_SEARCH_PARAMS.PROJECT, projectCode!);
  const LINK = {
    MODAL: isLoggedIn ? MODAL_ROUTES.REQUEST_PROJECT_ACCESS : MODAL_ROUTES.LOGIN,
    TO: isLoggedIn
      ? {
          ...location,
          hash: MODAL_ROUTES.REQUEST_PROJECT_ACCESS,
          search: searchParams.toString(),
        }
      : {
          ...location,
          hash: MODAL_ROUTES.LOGIN,
        },
    TEXT: isLoggedIn ? 'Request Access' : 'Login',
  };
  return (
    <>
      <Text>
        You do not currently have access to view project data{' '}
        {isProject ? 'at the project level view' : `for the selected ${displayType}`}
      </Text>
      <Text>
        {isLoggedIn && (
          <span>If you believe you should be granted access to view this data, you may</span>
        )}
        <RequestAccessButton to={LINK.TO}>{LINK.TEXT}</RequestAccessButton>
      </Text>
    </>
  );
};
