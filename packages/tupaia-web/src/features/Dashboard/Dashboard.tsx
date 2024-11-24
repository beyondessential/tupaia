/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { DEFAULT_BOUNDS } from '@tupaia/ui-map-components';
import { ErrorBoundary, SpinningLoader } from '@tupaia/ui-components';
import { MatrixConfig } from '@tupaia/types';
import { MOBILE_BREAKPOINT } from '../../constants';
import { useDashboards, useEntity, useProject, useUser } from '../../api/queries';
import { DashboardItem as DashboardItemType } from '../../types';
import { gaEvent, getDefaultDashboard } from '../../utils';
import { DashboardItem } from '../DashboardItem';
import { EnlargedDashboardItem } from '../EnlargedDashboardItem';
import { ExpandButton } from './ExpandButton';
import { Photo } from './Photo';
import { Breadcrumbs } from './Breadcrumbs';
import { StaticMap } from './StaticMap';
import { ExportDashboard } from './ExportDashboard';
import { DashboardContextProvider, useDashboard } from './utils';
import { SubscribeModal, DashboardMenu } from './DashboardMenu';
import { useEditUser } from '../../api/mutations';

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

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectCode, entityCode } = useParams();
  const { data: project, isLoading: isLoadingProject } = useProject(projectCode);
  const { data: user } = useUser();
  const { mutate: updateUser } = useEditUser();

  useEffect(() => {
    if (project?.code !== user?.project?.code) {
      updateUser({ projectId: project?.id });
    }
  }, [project?.code, user?.project?.code]);

  const { activeDashboard } = useDashboard();
  const {
    data: dashboards,
    isLoading: isLoadingDashboards,
    isError,
    isFetched,
  } = useDashboards(projectCode, entityCode);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: entity } = useEntity(projectCode, entityCode);
  const bounds = entity?.bounds || DEFAULT_BOUNDS;

  // we don't want useEntityLink to take care of this because useEntityLink gets called for all child entities on the map, meaning lots of extra queries when we don't need them. Instead the redirect will be taken care of in the useEffect below, as needed
  const defaultDashboardName = getDefaultDashboard(
    project,
    dashboards,
    isLoadingDashboards,
    isError,
  );

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    gaEvent('Pages', 'Toggle Info Panel');
  };

  // check for valid dashboard name, and if not valid and not still loading, redirect to default dashboard
  const dashboardNotFound =
    isFetched &&
    !isError &&
    !isLoadingDashboards &&
    !isLoadingProject &&
    project?.code === projectCode &&
    !activeDashboard;

  useEffect(() => {
    if (dashboardNotFound) {
      navigate({
        ...location,
        pathname: `/${projectCode}/${entityCode}/${defaultDashboardName}`,
      });
    }
  }, [dashboardNotFound, defaultDashboardName]);

  // Filter out drill down items from the dashboard items
  const visibleDashboards =
    (activeDashboard?.items as DashboardItemType[])?.reduce(
      (items: DashboardItemType[], item: DashboardItemType) => {
        const isDrillDown = activeDashboard?.items?.some(dashboardItem => {
          const { config } = dashboardItem as {
            config: MatrixConfig;
          };
          if (config?.drillDown && config?.drillDown?.itemCode === item.code) return true;
          return false;
        });
        return isDrillDown ? items : [...items, item];
      },
      [],
    ) ?? [];
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
                <StaticMap bounds={bounds} title={title} />
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
