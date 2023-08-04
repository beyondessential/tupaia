/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import DownloadIcon from '@material-ui/icons/GetApp';
import MuiIconButton from '@material-ui/core/IconButton';
import { FlexColumn } from '@tupaia/ui-components';
import { Modal } from '../../../components';
import { MapTable, MeasureData, useMapDataExport } from '@tupaia/ui-map-components';
import { useParams } from 'react-router';
import { useEntityAncestors, useMapOverlays, useEntitiesWithLocation } from '../../../api/queries';
import { useMapOverlayReport } from '../utils';
import { processMeasureData } from '../MapOverlays/processMeasureData';

const Wrapper = styled(FlexColumn)`
  justify-content: flex-start;
`;

const Title = styled.div.attrs({
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

const useEntitiesByMeasureLevel = (measureLevel?: string) => {
  const { projectCode, entityCode } = useParams();
  const getSnakeCase = (measureLevel?: string) => {
    return measureLevel
      ?.split(/\.?(?=[A-Z])/)
      .join('_')
      .toLowerCase();
  };

  return useEntitiesWithLocation(
    projectCode,
    entityCode,
    {
      params: {
        includeRoot: false,
        filter: {
          type: getSnakeCase(measureLevel),
        },
      },
    },
    { enabled: !!measureLevel },
  );
};

export const MapTableModal = ({ setIsOpen, measureOptions, measureData }: any) => {
  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: entitiesData } = useEntitiesByMeasureLevel(selectedOverlay?.measureLevel);
  const { data: mapOverlayData } = useMapOverlayReport();

  if (!entitiesData || !mapOverlayData) {
    return null;
  }

  const processedMeasureData = processMeasureData({
    entitiesData,
    measureData: mapOverlayData.measureData,
    serieses: mapOverlayData.serieses,
    hiddenValues: {},
  });

  if (!processedMeasureData || !mapOverlayData) {
    return null;
  }

  const { serieses } = mapOverlayData;
  const { data = [] } = useEntityAncestors(projectCode, entityCode);
  const entityArray = data.reverse();
  const titleText = `${selectedOverlay.name}, ${entityArray[1].name}`;
  const startDate = serieses.startDate;
  const endDate = serieses.endDate;

  const { doExport } = useMapDataExport(
    serieses,
    processedMeasureData as MeasureData[],
    titleText,
    startDate,
    endDate,
  );

  return (
    <>
      <Modal isOpen onClose={() => handleCloseModal()}>
        <Wrapper>
          <TitleWrapper>
            <Title>{titleText}</Title>
            <IconButton>
              <DownloadIcon onClick={doExport} />
            </IconButton>
          </TitleWrapper>
          <MapTable
            serieses={serieses}
            measureData={processedMeasureData as MeasureData[]}
          ></MapTable>
        </Wrapper>
      </Modal>
    </>
  );
};
