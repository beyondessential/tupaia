/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { getAllSurveyComponents, useSurveyForm } from '../..';
import { Typography } from '@material-ui/core';
import { QRCode } from './QRCode';

const Wrapper = styled.div`
  background-color: white;
  height: 100%;
  width: 30%;
  max-width: 24rem;
  position: absolute;
  top: 0;
  right: 0;
  overflow: auto;
  padding-top: 5rem; // to allow space for the success notification
`;

const Container = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const SurveyQRCodePanel = () => {
  const { surveyScreens } = useSurveyForm();
  const allSurveyScreenComponents = getAllSurveyComponents(surveyScreens);

  const qrCodeComponents = allSurveyScreenComponents?.filter(
    component => component.config?.entity?.generateQrCode,
  );
  if (!qrCodeComponents?.length) return null;
  console.log(qrCodeComponents);
  // TODO: get this from survey success response
  const createdEntities = [
    {
      id: '1234',
      name: 'the name 1',
    },
    {
      id: '5678',
      name: 'the name 2',
    },
    {
      id: '78910',
      name: 'the name 3',
    },
    {
      id: '11121314',
      name: 'the name 4',
    },
  ];
  if (!createdEntities.length) return null;
  return (
    <Wrapper>
      <Container>
        <Title>QR Code generated</Title>
        <Typography>
          Your survey has successfully generated the below QR code. Download it below to print or
          share with others.
        </Typography>
        {createdEntities.map(entity => (
          <QRCode key={entity.id} entity={entity} />
        ))}
      </Container>
    </Wrapper>
  );
};
