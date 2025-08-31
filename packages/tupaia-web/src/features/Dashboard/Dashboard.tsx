import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { MatrixConfig } from '@tupaia/types';
import { ErrorBoundary, SpinningLoader } from '@tupaia/ui-components';

import { useEditUser } from '../../api/mutations';
import { useDashboards, useEntity, useProject, useUser } from '../../api/queries';
import { MOBILE_BREAKPOINT } from '../../constants';
import { DashboardItem as DashboardItemType, ProjectCode } from '../../types';
import { gaEvent, useDefaultDashboardName } from '../../utils';
import { DashboardItem } from '../DashboardItem';
import { EnlargedDashboardItem } from '../EnlargedDashboardItem';
import { Breadcrumbs } from './Breadcrumbs';
import { DashboardMenu, SubscribeModal } from './DashboardMenu';
import { ExpandButton } from './ExpandButton';
import { ExportDashboard } from './ExportDashboard';
import { Photo } from './Photo';
import { StaticMap } from './StaticMap';
import { DashboardContextProvider, useDashboardContext } from './utils';

const Panel = styled.div<{
  $isExpanded: boolean;
}>`
  position: relative;
  background-color: ${({ theme }) => theme.palette.background.paper};
  width: 100%;
  overflow: visible;
  min-height: 100%;

  @media (prefers-reduced-motion: no-preference) {
    transition: inline-size 300ms var(--ease-out-quad);
  }

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    block-size: 100%;
    inline-size: ${props =>
      props.$isExpanded ? 'clamp(700px, 60%, 1000px)' : 'clamp(260px, 25%, 550px)'};
  }
`;

const ScrollBody = styled.div`
  position: relative;
  height: 100%;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    overflow-y: scroll;
  }
`;

const StickyBar = styled.div<{
  $isExpanded: boolean;
}>`
  position: sticky;
  top: 0;
  z-index: 10;

  h3 {
    padding-left: ${({ $isExpanded }) => ($isExpanded ? '1rem' : '0rem')};
  }

  > .MuiButtonBase-root {
    padding-left: ${({ $isExpanded }) => ($isExpanded ? '2rem' : '1.2rem')};
  }
`;

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.palette.background.default};

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const Title = styled(Typography)`
  color: white;
  font-weight: 400;
  font-size: 1.625rem;
  line-height: 1.4;
`;

const DashboardItemsWrapper = styled.div<{
  $isExpanded: boolean;
}>`
  padding: ${({ $isExpanded }) => ($isExpanded ? '0 2rem' : '0')};
  display: ${({ $isExpanded }) =>
    $isExpanded
      ? 'grid'
      : 'block'}; // when in a column, the items should be stacked vertically. Setting to display: block fixes and issue with the chart not contracting to the correct width
  background-color: ${({ theme }) => theme.palette.background.paper};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 0.8rem;
`;

const useUpdateUserProjectOnSettled = (projectCode?: ProjectCode) => {
  const { data: project, isSuccess: isProjectSuccess } = useProject(projectCode);
  const { data: user, isSuccess: isUserSuccess } = useUser();
  const { mutate: mutateUser } = useEditUser();
  const shouldUpdate = isUserSuccess && isProjectSuccess && project?.code !== user?.project?.code;
  useEffect(() => {
    if (shouldUpdate) mutateUser({ projectId: project?.id });
  }, [mutateUser, project?.id, shouldUpdate]);
};

export const Dashboard = () => {
  const { projectCode, entityCode } = useParams();
  const { data: project, isSuccess: isProjectSuccess } = useProject(projectCode);

  useUpdateUserProjectOnSettled(projectCode);

  const { activeDashboard } = useDashboardContext();
  const { isLoading: isLoadingDashboards, isSuccess: isDashboardsSuccess } = useDashboards(
    projectCode,
    entityCode,
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: entity } = useEntity(projectCode, entityCode);

  // check for valid dashboard name, and if not valid and not still loading, redirect to default dashboard
  const defaultDashboardName = useDefaultDashboardName(projectCode, entityCode);
  const { search, hash, state } = useLocation();
  const navigate = useNavigate();
  const dashboardNotFound = isProjectSuccess && isDashboardsSuccess && !activeDashboard;
  useEffect(() => {
    if (dashboardNotFound && defaultDashboardName) {
      navigate(
        {
          pathname: `/${projectCode}/${entityCode}/${encodeURIComponent(defaultDashboardName)}`,
          search,
          hash,
        },
        { replace: true, state },
      );
    }
  }, [
    dashboardNotFound,
    defaultDashboardName,
    entityCode,
    hash,
    navigate,
    projectCode,
    search,
    state,
  ]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    gaEvent('Pages', 'Toggle Info Panel');
  };

  // Filter out drill down items from the dashboard items
  const visibleDashboards =
    activeDashboard?.items?.filter(item => {
      const isDrillDown = activeDashboard?.items?.some(dashboardItem => {
        const config = dashboardItem.config as MatrixConfig;
        return config?.drillDown?.itemCode === item.code;
      });
      return !isDrillDown;
    }) ?? [];

  const title =
    entity?.type === 'project' && project?.config?.projectDashboardHeader
      ? project.config.projectDashboardHeader
      : entity?.name;

  return (
    <ErrorBoundary>
      <DashboardContextProvider>
        <Panel $isExpanded={isExpanded}>
          <ExpandButton setIsExpanded={toggleExpanded} isExpanded={isExpanded} />
          <ScrollBody>
            <Breadcrumbs />
            <div>
              {entity?.imageUrl ? (
                <Photo title={title} photoUrl={entity?.imageUrl} />
              ) : (
                // Don’t pass `null` bounds so that StaticMap uses its internal default
                <StaticMap bounds={entity?.bounds ?? undefined} title={title} />
              )}
            </div>
            <StickyBar $isExpanded={isExpanded}>
              <TitleBar>
                <Title variant="h3">{title}</Title>
              </TitleBar>
              <DashboardMenu />
            </StickyBar>
            <DashboardItemsWrapper $isExpanded={isExpanded}>
              {isLoadingDashboards && <SpinningLoader mt={5} />}
              {visibleDashboards?.map(item => (
                <DashboardItem key={item.code} dashboardItem={item as DashboardItemType} />
              ))}
            </DashboardItemsWrapper>
          </ScrollBody>
          <EnlargedDashboardItem entityName={entity?.name} />
          <ExportDashboard />
          <SubscribeModal key={activeDashboard?.code} />
        </Panel>
      </DashboardContextProvider>
    </ErrorBoundary>
  );
};
