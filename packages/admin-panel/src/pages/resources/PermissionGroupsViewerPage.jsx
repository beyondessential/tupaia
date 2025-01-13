import React from 'react';
import styled from 'styled-components';
import { HorizontalTree } from '@tupaia/ui-components';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, PageBody } from '../../widgets';
import { LogsModal } from '../../logsTable';
import { get } from '../../VizBuilderApp/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

const Container = styled(PageBody)`
  overflow: auto;
`;

const StyledHorizontalTree = styled(HorizontalTree)`
  margin-top: 40px;
  margin-bottom: 40px;
  max-height: 870px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const getRootLevelNodes = data =>
  data.filter(({ parent_id: parentId }) => !data.some(({ id }) => id === parentId)); // Cannot find parent

const getChildrenOfNode = (data, nodeId) =>
  data.filter(({ parent_id: parentId }) => parentId === nodeId);

const getDescendantData = (parentNodeId, data) => {
  const nodes = !parentNodeId ? getRootLevelNodes(data) : getChildrenOfNode(data, parentNodeId);
  return nodes
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(node => {
      const children = data.filter(childNode => childNode.parent_id === node.id);
      return { id: node.id, name: node.name, children };
    });
};

const usePermissionGroups = () => {
  const { isLoading, data } = useQuery(
    ['permissionGroups'],
    async () => get(`permissionGroups?pageSize=1000`), // Fetch all records
    DEFAULT_REACT_QUERY_OPTIONS,
  );

  const fetchRoot = () => (isLoading ? null : getDescendantData(null, data));
  const fetchBranch = (selectedRoot, node) => (isLoading ? null : getDescendantData(node.id, data));

  return { fetchRoot, fetchBranch };
};
export const PermissionGroupsViewerPage = () => {
  const { fetchRoot, fetchBranch } = usePermissionGroups();

  return (
    <>
      <Container>
        <PageHeader title="Permission Groups" />
        <StyledHorizontalTree fetchRoot={fetchRoot} fetchBranch={fetchBranch} readOnly />
      </Container>
      <LogsModal />
    </>
  );
};
