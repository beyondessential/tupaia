/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { OldImportModal } from '../importExport';
import { usePortalWithCallback } from '../utilities';
import { Header, PageBody } from '../widgets';

const importConfig = {
  title: 'Import Lab Results',
  actionConfig: {
    importEndpoint: 'striveLabResults',
  },
};

const StyledBody = styled(PageBody)`
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
        <Typography variant="h4" gutterBottom>
          Import lab results
        </Typography>
        <Typography>Use the above Import button to import lab results.</Typography>
      </StyledBody>
      <OldImportModal {...importConfig} />
    </>
  );
};

StrivePage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
