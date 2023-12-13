/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { RequestProjectAccess } from '../features';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../constants';

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
  const onReturnToProjects = () => {
    navigate(ROUTES.PROJECT_SELECT);
  };

  return (
    <Wrapper>
      <RequestProjectAccess projectCode={projectCode} onClose={onReturnToProjects} />
    </Wrapper>
  );
};
