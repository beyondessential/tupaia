/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { RequestProjectAccess as UIRequestProjectAccess } from '@tupaia/ui-components';
import { useCountryAccessList, useProject, useRequestProjectAccess } from '../api';

interface RequestProjectAccessProps {
  variant?: 'page' | 'modal';
  projectCode?: string;
  onBack?: () => void;
}

export const RequestProjectAccess = ({ projectCode, onBack }: RequestProjectAccessProps) => {
  const { data: project, isLoading: isLoadingProject, isFetched } = useProject(projectCode);
  const { mutate: requestProjectAccess, isLoading, isSuccess } = useRequestProjectAccess();
  const { data: countries } = useCountryAccessList(projectCode);

  return (
    <UIRequestProjectAccess
      onBack={onBack}
      project={project}
      onSubmit={requestProjectAccess}
      isLoading={isLoadingProject}
      isSubmitting={isLoading || !isFetched}
      isSuccess={isSuccess}
      countries={countries}
    />
  );
};
