import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { MatrixConfig } from '@tupaia/types';
import { ErrorBoundary, SpinningLoader } from '@tupaia/ui-components';
import { DEFAULT_BOUNDS } from '@tupaia/ui-map-components';

import { useEditUser } from '../../api/mutations';
import { useDashboards, useEntity, useProject, useUser } from '../../api/queries';
import { MOBILE_BREAKPOINT } from '../../constants';
import { DashboardItem as DashboardItemType } from '../../types';
import { gaEvent } from '../../utils';
import { DashboardItem } from '../DashboardItem';
import { EnlargedDashboardItem } from '../EnlargedDashboardItem';
import { Breadcrumbs } from './Breadcrumbs';
import { DashboardMenu, SubscribeModal } from './DashboardMenu';
import { ExpandButton } from './ExpandButton';
import { ExportDashboard } from './ExportDashboard';
import { Photo } from './Photo';
import { StaticMap } from './StaticMap';
import { DashboardContextProvider, useDashboard } from './utils';

const Panel = styled.div<{
  $isExpanded: boolean;
}>`
  background-color: ${({ theme }) => theme.palette.background.paper};
  inline-size: 100%;
  min-block-size: 100%;
  overflow: visible;
  position: relative;
  transition:
    width 0.3s ease,
    max-width 0.3s ease;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    block-size: 100%;

    ${({ $isExpanded }) =>
      $isExpanded
        ? css`
            inline-size: 60%;
            max-inline-size: 1000px;
            min-inline-size: 700px;
          `
        : css`
            inline-size: 25%;
            max-inline-size: 550px;
            min-inline-size: 360px;
          `}
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
  const { projectCode, entityCode } = useParams();
  const { data: project } = useProject(projectCode);
  const { data: user } = useUser();
  const { mutate: updateUser } = useEditUser();

  useEffect(() => {
    if (project?.code !== user?.project?.code) {
      updateUser({ projectId: project?.id });
    }
  }, [project?.code, user?.project?.code]);

  const { activeDashboard } = useDashboard();
  const { isLoading: isLoadingDashboards } = useDashboards(projectCode, entityCode);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: entity } = useEntity(projectCode, entityCode);
  const bounds = entity?.bounds || DEFAULT_BOUNDS;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    gaEvent('Pages', 'Toggle Info Panel');
  };

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
