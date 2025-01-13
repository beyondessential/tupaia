import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Box from '@material-ui/core/Box';
import { ColumnFilterContainer } from './ColumnFilter';
import { RecursiveColumn } from './RecursiveColumn';
import { Column } from './Column';
import { useFetch } from '../../hooks';

const Container = styled.div`
  display: flex;
  align-items: stretch;
  height: 100%;
`;

const RootContainer = styled.div`
  display: flex;
  margin-right: 10px;
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  border-radius: 5px 5px 0px 0px;

  .TupaiaHorizontalTreeColumn-content {
    border-right: none;
  }
`;

const DescendantsContainer = styled.div`
  display: flex;
  flex: 1;
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  border-radius: 5px 5px 0px 0px;
`;

export const HorizontalTree = ({ fetchRoot, fetchBranch, className, readOnly }) => {
  const [selectedRoot, setSelectedRoot] = useState(undefined);
  const rootQuery = useFetch(fetchRoot);
  const branchQuery = useFetch(fetchBranch);

  useEffect(() => {
    rootQuery.fetchData();
  }, [rootQuery.fetchData]);

  return (
    <Container className={className}>
      <RootContainer>
        <Column
          data={rootQuery.data}
          isLoading={rootQuery.isLoading}
          error={rootQuery.error}
          onSelect={() => {
            setSelectedRoot(undefined);
            branchQuery.clearData();
          }}
          onExpand={rootNode => {
            setSelectedRoot(rootNode);
            branchQuery.fetchData(rootNode, rootNode);
          }}
          showExpandIcon={false}
        />
      </RootContainer>
      <DescendantsContainer>
        {branchQuery.isTriggered && (
          <RecursiveColumn
            data={branchQuery.data}
            isLoading={branchQuery.isLoading}
            error={branchQuery.error}
            fetchData={node => fetchBranch(selectedRoot, node)}
            readOnly={readOnly}
          />
        )}
        <Box display="flex" flexDirection="column" width="100%">
          <ColumnFilterContainer />
        </Box>
      </DescendantsContainer>
    </Container>
  );
};

HorizontalTree.propTypes = {
  fetchRoot: PropTypes.func.isRequired,
  fetchBranch: PropTypes.func.isRequired,
  className: PropTypes.string,
  readOnly: PropTypes.bool,
};

HorizontalTree.defaultProps = {
  className: undefined,
  readOnly: false,
};
