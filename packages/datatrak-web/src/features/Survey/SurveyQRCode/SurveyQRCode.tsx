import React from 'react';

import { useIsMobile } from '../../../utils';
import { QRCodeList } from './QRCodeList';
import { QRCodeModal } from './QRCodeModal';
import { QRCodePanel } from './QRCodePanel';
import { Entity } from '../../../types';

export const SurveyQRCode = ({
  className,
  qrCodeEntitiesCreated,
}: {
  className?: string;
  qrCodeEntitiesCreated: Entity[];
}) => {
  return useIsMobile() ? (
    <QRCodeModal className={className}>
      <QRCodeList createdEntities={qrCodeEntitiesCreated} variant="modal" />
    </QRCodeModal>
  ) : (
    <QRCodePanel className={className}>
      <QRCodeList createdEntities={qrCodeEntitiesCreated} />
    </QRCodePanel>
  );
};
