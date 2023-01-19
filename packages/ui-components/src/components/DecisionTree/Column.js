/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { ColumnFilter, useFilter } from './ColumnFilter';
import { FetchLoader } from '../FetchLoader';

const CLASS_NAME = 'TupaiaDecisionTreeColumn';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ContentContainer = styled.div`
  flex: 1;
  width: 248px;
  padding: 12px;
  overflow-y: auto;
  border-right: 1px solid ${({ theme }) => theme.palette.grey['400']};

  .MuiButtonBase-root {
    border-radius: 10px;
  }
`;

export const Column = ({ data, isLoading, error, showExpandIcon, onSelect, onExpand }) => {
  const { updateFilter, applyFilter, checkMatchesFilter } = useFilter();
  const [selected, setSelected] = useState(undefined);

  const filteredData = applyFilter(data, { field: 'name' });
  const isError = !!error;

  useEffect(() => {
    setSelected(undefined);
  }, [data]);

  useEffect(() => {
    if (selected !== undefined && !checkMatchesFilter(selected.name)) {
      // Selected item is no longer visible, clear it
      setSelected(undefined);
      onSelect(undefined);
    }
  }, [selected, checkMatchesFilter, onSelect]);

  const handleClickItem = useCallback(
    node => {
      setSelected(node);
      onSelect(node);
      if (!showExpandIcon) {
        // Expand icon is not shown, expand when we click anywhere on the item
        onExpand(node);
      }
    },
    [showExpandIcon, onSelect, onExpand],
  );

  const handleClickIcon = useCallback(
    (node, e) => {
      e.stopPropagation();
      setSelected(node);
      onExpand(node);
    },
    [onExpand],
  );

  return (
    <>
      <Container>
        <ColumnFilter onChange={updateFilter} disabled={isLoading || isError} />
        <ContentContainer className={`${CLASS_NAME}-content`}>
          <FetchLoader isLoading={isLoading} isError={isError} error={error}>
            <List>
              {filteredData?.length === 0 && (
                <ListItem>
                  <ListItemText primary="No data found" color="primary" />
                </ListItem>
              )}
              {filteredData?.map(node => {
                const hasChildren = node.children.length > 0;

                return (
                  <ListItem
                    key={node.id}
                    button
                    selected={selected?.id === node.id}
                    onClick={() => handleClickItem(node)}
                  >
                    <ListItemText primary={node.name} color="primary" />
                    {showExpandIcon && hasChildren && (
                      <IconButton aria-label="Expand item" size="small">
                        <ChevronRightIcon onClick={e => handleClickIcon(node, e)} />
                      </IconButton>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </FetchLoader>
        </ContentContainer>
      </Container>
    </>
  );
};

Column.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }),
  ),
  isLoading: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
  }),
  showExpandIcon: PropTypes.bool,
  onSelect: PropTypes.func,
  onExpand: PropTypes.func,
};

Column.defaultProps = {
  data: undefined,
  isLoading: false,
  error: null,
  showExpandIcon: true,
  onSelect: () => {},
  onExpand: () => {},
};
