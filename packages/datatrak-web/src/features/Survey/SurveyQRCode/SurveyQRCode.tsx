import React from 'react';
import { useLocation } from 'react-router';
import { QRCodeList } from './QRCodeList';
import { QRCodeModal } from './QRCodeModal';
import { QRCodePanel } from './QRCodePanel';

export const SurveyQRCode = () => {
  const { state } = useLocation();
  if (!state) return null;

  const { surveyResponse } = state as { surveyResponse: string };
  if (!surveyResponse) return null;

  const { qrCodeEntitiesCreated } = JSON.parse(surveyResponse);
  if (!qrCodeEntitiesCreated.length) return null;

  return (
    <>
      <QRCodePanel>
        <QRCodeList createdEntities={qrCodeEntitiesCreated} />
      </QRCodePanel>
      <QRCodeModal>
        <QRCodeList createdEntities={qrCodeEntitiesCreated} variant="modal" />
      </QRCodeModal>
    </>
  );
};
