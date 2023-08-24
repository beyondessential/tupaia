/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import DownloadIcon from '@material-ui/icons/GetApp';
import MuiIconButton from '@material-ui/core/IconButton';
import { FlexColumn } from '@tupaia/ui-components';
import { Typography } from '@material-ui/core';
import { MapTable, useMapDataExport } from '@tupaia/ui-map-components';
import { useMapOverlayData } from '../utils';
import { Modal } from '../../../components';
import { useEntityAncestors, useMapOverlays } from '../../../api/queries';
import { Entity } from '../../../types';

const Wrapper = styled(FlexColumn)`
  justify-content: flex-start;
  width: 100%;
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
  const { data } = useEntityAncestors(projectCode, entityCode);
  const countryObject = data?.find((entity: Entity) => entity.type === 'country');
  const { serieses, measureData } = useMapOverlayData(null, countryObject);

  const titleText = `${selectedOverlay.name}, ${countryObject?.name}`;

  const startDate = serieses.startDate;
  const endDate = serieses.endDate;

  const { doExport } = useMapDataExport(
    serieses,
    measureData,
    titleText,
    startDate,
    endDate,
  );

  return (
    <Modal isOpen onClose={onClose}>
      <Wrapper>
        <TitleWrapper>
          <Title>{titleText}</Title>
          <IconButton onClick={doExport}>
            <DownloadIcon />
          </IconButton>
        </TitleWrapper>
        <MapTable serieses={serieses!} measureData={measureData!} />
      </Wrapper>
    </Modal>
  );
};
