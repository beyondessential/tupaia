/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { HorizontalTree } from '@tupaia/ui-components';
import { Header, PageBody } from '../../widgets';
import { usePortalWithCallback } from '../../utilities';
import { LogsModal } from '../../logsTable';
import * as COLORS from '../../theme/colors';
import { useApi } from '../../utilities/ApiProvider';

const Container = styled(PageBody)`
  overflow: auto;
`;

const StyledHorizontalTree = styled(HorizontalTree)`
  margin-top: 40px;
  margin-bottom: 40px;
  max-height: 870px;
  color: ${COLORS.TEXT_MIDGREY};

  .MuiTypography-body1 {
    font-size: 15px;
  }
`;

export const TreeResourcePage = ({ endpoint, nodeKey, title, getHeaderEl }) => {
  const api = useApi();
  const HeaderPortal = usePortalWithCallback(<Header title={title} />, getHeaderEl);

  const fetchData = useCallback(
    async (rootNode, node) => {
      const url = rootNode ? `${endpoint}/${rootNode[nodeKey]}/${node[nodeKey]}` : endpoint;
      const { body } = await api.get(url);
      return body;
    },
    [api],
  );

  return (
    <>
      {HeaderPortal}
      <Container>
        <StyledHorizontalTree fetchData={fetchData} />
      </Container>
      <LogsModal />
    </>
  );
};

TreeResourcePage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  endpoint: PropTypes.func.isRequired,
  nodeKey: PropTypes.string,
  title: PropTypes.string.isRequired,
};

TreeResourcePage.defaultProps = {
  nodeKey: 'id',
};
