/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { HorizontalTree } from '@tupaia/ui-components';
import { useQuery } from 'react-query';
import { Header, PageBody } from '../../widgets';
import { usePortalWithCallback } from '../../utilities';
import { LogsModal } from '../../logsTable';
import * as COLORS from '../../theme/colors';
import { get } from '../../VizBuilderApp/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

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

function getDescendantData(parentNodeId, data) {
  return data
    .filter(node => node.parent_id === parentNodeId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(node => {
      const children = data.filter(childNode => childNode.parent_id === node.id);
      return { id: node.id, name: node.name, children };
    });
}

const usePermissionGroups = () => {
  const { isLoading, data } = useQuery(
    ['permissionGroups'],
    async () => get('permissionGroups'),
    DEFAULT_REACT_QUERY_OPTIONS,
  );

  function fetchData(selectedRoot, node) {
    if (isLoading) {
      return null;
    }

    if (node) {
      return getDescendantData(node.id, data);
    }

    return getDescendantData(null, data);
  }

  return { fetchData };
};
export const PermissionGroupsViewerPage = ({ getHeaderEl }) => {
  const HeaderPortal = usePortalWithCallback(<Header title="Permission Groups" />, getHeaderEl);
  const { fetchData } = usePermissionGroups();

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

PermissionGroupsViewerPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
