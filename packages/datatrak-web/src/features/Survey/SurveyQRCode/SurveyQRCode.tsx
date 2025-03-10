import React from 'react';

import { useIsMobile } from '../../../utils';
import { QRCodeList } from './QRCodeList';
import { QRCodeModal } from './QRCodeModal';
import { QRCodePanel } from './QRCodePanel';

export const SurveyQRCode = ({ qrCodeEntitiesCreated }) => {
  return useIsMobile() ? (
    <QRCodeModal>
      <QRCodeList createdEntities={qrCodeEntitiesCreated} variant="modal" />
    </QRCodeModal>
  ) : (
    <QRCodePanel>
      <QRCodeList createdEntities={qrCodeEntitiesCreated} />
    </QRCodePanel>
  );
};
