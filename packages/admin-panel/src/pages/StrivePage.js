/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Button } from '@tupaia/ui-components';
import styled from 'styled-components';
import { ImportModal, ImportButton } from '../importExport';
import { Body } from './Page';
import { usePortalWithCallback } from '../utilities';
import { Header } from '../widgets';

const importConfig = {
  title: 'Import Lab Results',
  actionConfig: {
    importEndpoint: 'striveLabResults',
  },
};

const StyledBody = styled(Body)`
  padding-top: 2rem;
`;

export const StrivePage = ({ getHeaderEl }) => {
  const HeaderPortal = usePortalWithCallback(
    <Header title="Strive" importConfig={importConfig} />,
    getHeaderEl,
  );
  return (
    <>
      {HeaderPortal}
      <StyledBody>
        <ImportButton {...importConfig} Button={Button} label="Import Lab Results" />
      </StyledBody>
      <ImportModal {...importConfig} />
    </>
  );
};
