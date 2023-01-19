/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { fade } from '@material-ui/core';
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

  .TupaiaDecisionTreeColumn-content {
    border-right: none;
  }

  .MuiList-root .Mui-selected {
    color: ${({ theme }) => theme.palette.primary.contrastText};
    background-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const DescendantsContainer = styled.div`
  display: flex;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  border-radius: 5px 5px 0px 0px;

  .MuiList-root .Mui-selected {
    color: ${({ theme }) => theme.palette.text.primary};
    background-color: ${({ theme }) => fade(theme.palette.primary.main, 0.1)};
  }
`;

export const DecisionTree = ({ fetchData }) => {
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
    <Container>
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
          />
        )}
        <Box display="flex" flexDirection="column" width="100%">
          <ColumnFilterContainer />
        </Box>
      </DescendantsContainer>
    </Container>
  );
};

DecisionTree.propTypes = {
  fetchData: PropTypes.func.isRequired,
};
