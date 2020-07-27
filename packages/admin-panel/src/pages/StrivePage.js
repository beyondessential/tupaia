import React from 'react';

import { ImportModal, ImportButton } from '../importExport';
import { Body } from './Page';

const importConfig = {
  title: 'Import Lab Results',
  actionConfig: {
    importEndpoint: 'striveLabResults',
  },
};

export const StrivePage = () => (
  <>
    <Body>
      <ImportButton {...importConfig} label="Import Lab Results" />
    </Body>
    <ImportModal {...importConfig} />
  </>
);
