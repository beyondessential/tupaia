/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { HorizontalTree } from '@tupaia/ui-components';
import { PageHeader, PageBody } from '../../widgets';
import { LogsModal } from '../../logsTable';
import * as COLORS from '../../theme/colors';

const Container = styled(PageBody)`
  overflow: auto;
`;

const StyledHorizontalTree = styled(HorizontalTree)`
  height: 930px;
  margin-top: 40px;
  margin-bottom: 40px;
  max-height: 870px;
  color: ${COLORS.TEXT_MIDGREY};

  .MuiTypography-body1 {
    font-size: 15px;
  }
`;

export const TreeResourcePage = ({ title, fetchRoot, fetchBranch, ExportModalComponent }) => {
  return (
    <>
      <Container>
        <PageHeader title={title} ExportModalComponent={ExportModalComponent} />
        <StyledHorizontalTree fetchRoot={fetchRoot} fetchBranch={fetchBranch} />
      </Container>
      <LogsModal />
    </>
  );
};

TreeResourcePage.defaultProps = {
  ExportModalComponent: null,
};

TreeResourcePage.propTypes = {
  title: PropTypes.string.isRequired,
  fetchRoot: PropTypes.func.isRequired,
  fetchBranch: PropTypes.func.isRequired,
  ExportModalComponent: PropTypes.elementType,
};
