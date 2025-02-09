import React from 'react';
import { QRCodeList } from './QRCodeList';
import { QRCodeModal } from './QRCodeModal';
import { QRCodePanel } from './QRCodePanel';

export const SurveyQRCode = ({ qrCodeEntitiesCreated }) => {
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
