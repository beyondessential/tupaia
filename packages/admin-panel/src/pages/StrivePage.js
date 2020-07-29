/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Button } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import { ImportModal, ImportButton } from '../importExport';
import { usePortalWithCallback } from '../utilities';
import { Header, PageBody } from '../widgets';

const importConfig = {
  title: 'Import Lab Results',
  actionConfig: {
    importEndpoint: 'striveLabResults',
  },
};

export const StrivePage = ({ getHeaderEl }) => {
  const HeaderPortal = usePortalWithCallback(
    <Header title="Strive" importConfig={importConfig} />,
    getHeaderEl,
  );
  return (
    <>
      {HeaderPortal}
      <PageBody>
        <ImportButton {...importConfig} Button={Button} label="Import Lab Results" />
      </PageBody>
      <ImportModal {...importConfig} />
    </>
  );
};

StrivePage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
