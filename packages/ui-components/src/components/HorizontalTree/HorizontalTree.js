/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Box from '@material-ui/core/Box';
import { ColumnFilterContainer } from './ColumnFilter';
import { RecursiveColumn } from './RecursiveColumn';
import { Column } from './Column';
import { useData } from '../../hooks/useData';

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

export const HorizontalTree = ({ fetchData, className, readOnly }) => {
  const [selectedRoot, setSelectedRoot] = useState(undefined);
  const { data, isLoading, error, fetchData: fetchRootData } = useData(fetchData);
  const {
    data: children,
    isLoading: areChildrenLoading,
    error: childrenError,
    clearData: clearChildren,
    fetchData: fetchChildren,
  } = useData(fetchData);

  useEffect(() => {
    fetchRootData();
  }, [fetchRootData]);

  return (
    <Container className={className}>
      <RootContainer>
        <Column
          data={data}
          isLoading={isLoading}
          error={error}
          onSelect={() => {
            setSelectedRoot(undefined);
            clearChildren();
          }}
          onExpand={rootNode => {
            setSelectedRoot(rootNode);
            fetchChildren(rootNode, rootNode);
          }}
          showExpandIcon={false}
        />
      </RootContainer>
      <DescendantsContainer>
        {(children || areChildrenLoading || childrenError) && (
          <RecursiveColumn
            data={children}
            isLoading={areChildrenLoading}
            error={childrenError}
            fetchData={node => fetchData(selectedRoot, node)}
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
  fetchData: PropTypes.func.isRequired,
  className: PropTypes.string,
  readOnly: PropTypes.bool,
};

HorizontalTree.defaultProps = {
  className: undefined,
  readOnly: false,
};
