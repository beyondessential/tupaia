/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { HorizontalTree } from '@tupaia/ui-components';
import { Header, PageBody } from '../../widgets';
import { usePortalWithCallback } from '../../utilities';
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

export const TreeResourcePage = ({ title, getHeaderEl, fetchRoot, fetchBranch }) => {
  const HeaderPortal = usePortalWithCallback(<Header title={title} />, getHeaderEl);

  return (
    <>
      {HeaderPortal}
      <Container>
        <StyledHorizontalTree fetchRoot={fetchRoot} fetchBranch={fetchBranch} />
      </Container>
      <LogsModal />
    </>
  );
};

TreeResourcePage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  fetchRoot: PropTypes.func.isRequired,
  fetchBranch: PropTypes.func.isRequired,
};
