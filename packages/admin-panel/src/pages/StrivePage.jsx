import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { PageBody, PageHeader } from '../widgets';

const importConfig = {
  title: 'Import lab results or vector data',
  actionConfig: {
    importEndpoint: 'striveLabResults',
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  },
};

const StyledBody = styled(PageBody)`
  padding-block-start: 2rem;
`;

export const StrivePage = () => {
  return (
    <StyledBody>
      <PageHeader title="Strive" importConfig={importConfig} />
      <Typography variant="h4" gutterBottom>
        Import lab results or vector data
      </Typography>
      <Typography>Use the above Import button to import lab results or vector data</Typography>
    </StyledBody>
  );
};
