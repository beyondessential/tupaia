import React from 'react';
import {
  RequestProjectAccess as UIRequestProjectAccess,
  RequestProjectAccessSuccessMessage,
} from '@tupaia/ui-components';
import styled from 'styled-components';
import { useCountryAccessList, useProject, useRequestProjectAccess } from '../api';
import { useIsMobile } from '../utils';
import { Button } from '../components';

const CancelButton = styled(Button)`
  margin-block: 1rem;
`;

interface RequestProjectAccessProps {
  variant?: 'page' | 'modal';
  projectCode?: string;
  onBack?: () => void;
}

export const RequestProjectAccess = ({ projectCode, onBack }: RequestProjectAccessProps) => {
  const { data: project, isLoading: isLoadingProject, isFetched } = useProject(projectCode);
  const { mutate: requestProjectAccess, isLoading, isSuccess, isIdle } = useRequestProjectAccess();
  const { data: countries = [] } = useCountryAccessList(projectCode);
  const isMobile = useIsMobile();

  if (isMobile && isSuccess) {
    return (
      <>
        <RequestProjectAccessSuccessMessage projectName={project?.name} position="center" />
        <CancelButton onClick={onBack}>Back to projects</CancelButton>
      </>
    );
  }

  return (
    <>
      <UIRequestProjectAccess
        onBack={onBack}
        project={project}
        onSubmit={requestProjectAccess}
        isLoading={isLoadingProject}
        isSubmitting={isLoading || !isFetched}
        isSuccess={isSuccess}
        countries={countries}
      />
      {isMobile && isIdle && (
        <CancelButton onClick={onBack} variant="outlined">
          Cancel
        </CancelButton>
      )}
    </>
  );
};
