import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { MatrixConfig } from '@tupaia/types';
import { ErrorBoundary, SpinningLoader } from '@tupaia/ui-components';
import { DEFAULT_BOUNDS } from '@tupaia/ui-map-components';

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
import { DashboardContextProvider, useDashboard } from './utils';

const MAX_SIDEBAR_EXPANDED_WIDTH = 1000;
const MAX_SIDEBAR_COLLAPSED_WIDTH = 550;
const MIN_SIDEBAR_WIDTH = 360;
const MIN_EXPANDED_SIDEBAR_WIDTH = 700;

const Panel = styled.div<{
  $isExpanded: boolean;
}>`
  position: relative;
  background-color: ${({ theme }) => theme.palette.background.paper};
  transition:
    width 0.3s ease,
    max-width 0.3s ease;
  width: 100%;
  overflow: visible;
  min-height: 100%;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    width: ${({ $isExpanded }) => ($isExpanded ? 60 : 25)}%;
    height: 100%;
    min-width: ${({ $isExpanded }) =>
      $isExpanded ? MIN_EXPANDED_SIDEBAR_WIDTH : MIN_SIDEBAR_WIDTH}px;
    max-width: ${({ $isExpanded }) =>
      $isExpanded ? MAX_SIDEBAR_EXPANDED_WIDTH : MAX_SIDEBAR_COLLAPSED_WIDTH}px;
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
  grid-template-columns: repeat(2, 1fr);
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
  const location = useLocation();
  const { projectCode, entityCode } = useParams();
  const { data: project, isSuccess: isProjectSuccess } = useProject(projectCode);
  const defaultDashboardName = useDefaultDashboardName(projectCode, entityCode);
  useUpdateUserProjectOnSettled(projectCode);

  const { activeDashboard } = useDashboard();
  const { isFetching: isFetchingDashboards, isSuccess: isDashboardsSuccess } = useDashboards(
    projectCode,
    entityCode,
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: entity } = useEntity(projectCode, entityCode);

  // check for valid dashboard name, and if not valid and not still loading, redirect to default dashboard

  const dashboardNotFound =
    isProjectSuccess && isDashboardsSuccess && project?.code === projectCode && !activeDashboard;
  if (dashboardNotFound && defaultDashboardName) {
    const to = `/${projectCode}/${entityCode}/${encodeURIComponent(defaultDashboardName)}`;
    return <Navigate {...location} to={to} />;
  }

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
      ? project?.config?.projectDashboardHeader
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
                <StaticMap bounds={entity?.bounds || DEFAULT_BOUNDS} title={title} />
              )}
            </div>
            <StickyBar $isExpanded={isExpanded}>
              <TitleBar>
                <Title variant="h3">{title}</Title>
              </TitleBar>
              <DashboardMenu />
            </StickyBar>
            <DashboardItemsWrapper $isExpanded={isExpanded}>
              {isFetchingDashboards && <SpinningLoader mt={5} />}
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
