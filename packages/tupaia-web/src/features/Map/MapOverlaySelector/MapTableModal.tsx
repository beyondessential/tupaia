/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import DownloadIcon from '@material-ui/icons/GetApp';
import MuiIconButton from '@material-ui/core/IconButton';
import { FlexColumn, SpinningLoader, NoData } from '@tupaia/ui-components';
import { Typography } from '@material-ui/core';
import { MapTable, useMapDataExport } from '@tupaia/ui-map-components';
import { useMapOverlayTableData } from '../utils';
import { Modal } from '../../../components';
import { useEntity, useEntityAncestors, useMapOverlays, useProject } from '../../../api/queries';
import { Entity } from '../../../types';

const Wrapper = styled(FlexColumn)`
  justify-content: flex-start;
  width: 100%;
  min-width: 48rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.25rem;
  line-height: 1.4;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-bottom: 1.5rem;
`;

const IconButton = styled(MuiIconButton)`
  margin-bottom: 1.5rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 3rem;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
`;

export const MapTableModal = ({ onClose }: any) => {
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: project } = useProject(projectCode);

  const { data: entityAncestors } = useEntityAncestors(projectCode, entityCode);
  const { data: entity } = useEntity(projectCode, entityCode);

  // use the project if the entity is a project, otherwise the country (e.g. if the current entity is a facility or a subdistrict. Most of the time project entities don't have map overlays so this won't happen much)
  const rootEntity =
    entity?.type === 'project'
      ? entity
      : entityAncestors?.find((entity: Entity) => entity.type === 'country');

  const { serieses, measureData, startDate, endDate, isLoading } = useMapOverlayTableData({
    rootEntityCode: rootEntity?.code,
  }); 

  // use the project projectDashboardHeader if the entity is a project and this is set, otherwise the root entity name
  const entityName =
    entity?.type === 'project' && project?.config?.projectDashboardHeader
      ? project?.config?.projectDashboardHeader
      : rootEntity?.name;

  const titleText = `${selectedOverlay.name}, ${entityName}`;

  const { doExport } = useMapDataExport(serieses, measureData, titleText, startDate, endDate);

  const hasNoData = (!measureData || !measureData.length) && !isLoading;

  return (
    <Modal isOpen onClose={onClose}>
      <Wrapper>
        <TitleWrapper>
          <Title>{titleText}</Title>
          <IconButton onClick={doExport} disabled={isLoading || hasNoData}>
            <DownloadIcon />
          </IconButton>
        </TitleWrapper>
        {isLoading && <SpinningLoader />}
        {hasNoData && (
          <NoData
            viewContent={{
              startDate,
              endDate,
            }}
          />
        )}
        {!isLoading && !hasNoData && <MapTable serieses={serieses} measureData={measureData} />}
      </Wrapper>
    </Modal>
  );
};
