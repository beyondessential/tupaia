/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RequestProjectAccess } from '@tupaia/ui-components';
import { ROUTES } from '../constants';
import { useCountryAccessList, useProject, useRequestProjectAccess } from '../api';

const Wrapper = styled(Paper).attrs({
  variant: 'outlined',
})`
  width: 48rem;
  display: flex;
  flex-direction: column;
`;

export const RequestProjectAccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectCode = searchParams.get('project') || '';

  const { data: project, isLoading: isLoadingProject, isFetched } = useProject(projectCode);
  const { mutate: requestProjectAccess, isLoading, isSuccess } = useRequestProjectAccess();
  const { data: countries } = useCountryAccessList(projectCode);

  const onReturnToProjects = () => {
    navigate(ROUTES.PROJECT_SELECT);
  };

  return (
    <Wrapper>
      <RequestProjectAccess
        onBack={onReturnToProjects}
        project={project}
        onSubmit={requestProjectAccess}
        isLoading={isLoadingProject || !isFetched}
        isSubmitting={isLoading}
        isSuccess={isSuccess}
        countries={countries}
      />
    </Wrapper>
  );
};
