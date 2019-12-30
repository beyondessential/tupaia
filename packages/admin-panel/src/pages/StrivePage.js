import React from 'react';

import { ImportExportModal, ImportButton } from '../importExport';
import { Body, Header, Title, Page } from './Page';

const importConfig = {
  title: 'Import Lab Results',
  actionConfig: {
    importEndpoint: 'striveLabResults',
  },
};

export const StrivePage = () => (
  <Page>
    <Header>
      <Title>Strive</Title>
    </Header>
    <Body>
      <ImportButton {...importConfig} label="Import Lab Results" />
    </Body>
    <ImportExportModal {...importConfig} />
  </Page>
);
