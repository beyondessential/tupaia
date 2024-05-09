/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { HorizontalTree } from '@tupaia/ui-components';
import { PageBody, PageHeader } from '../../widgets';
import { LogsModal } from '../../logsTable';
import * as COLORS from '../../theme/colors';
import { generateTitle } from './resourceName';

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

export const TreeResourcePage = ({
  resourceName,
  title,
  fetchRoot,
  fetchBranch,
  ExportModalComponent,
}) => {
  return (
    <>
      <Container>
        <PageHeader
          title={title ?? generateTitle(resourceName)}
          ExportModalComponent={ExportModalComponent}
        />
        <StyledHorizontalTree fetchRoot={fetchRoot} fetchBranch={fetchBranch} />
      </Container>
      <LogsModal />
    </>
  );
};

TreeResourcePage.defaultProps = {
  resourceName: {},
  ExportModalComponent: null,
};

TreeResourcePage.propTypes = {
  resourceName: PropTypes.shape({
    singular: PropTypes.string.isRequired,
    plural: PropTypes.string,
  }),
  title: PropTypes.string.isRequired,
  fetchRoot: PropTypes.func.isRequired,
  fetchBranch: PropTypes.func.isRequired,
  ExportModalComponent: PropTypes.elementType,
};
