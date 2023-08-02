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
import { MapTable } from '@tupaia/ui-map-components';
import { useParams } from 'react-router';
import { useEntityAncestors } from '../../../api/queries';

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

export const MapTableModal = ({
  serieses,
  selectedOverlay,
  processedMeasureData,
  setIsOpen,
}: any) => {
  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const { projectCode, entityCode } = useParams();
  const { data = [] } = useEntityAncestors(projectCode, entityCode);
  const entityArray = data.reverse();
  console.log(entityArray);

  const titleText = `${selectedOverlay.name}, ${entityArray[1].name}`;

  return (
    <>
      <Modal isOpen onClose={() => handleCloseModal()} disablePortal={false}>
        <Wrapper>
          <TitleWrapper>
            <Title>{titleText}</Title>
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </TitleWrapper>
          <MapTable serieses={serieses} measureData={processedMeasureData}></MapTable>
        </Wrapper>
      </Modal>
    </>
  );
};
