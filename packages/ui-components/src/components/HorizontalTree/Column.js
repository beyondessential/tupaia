/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { darken, fade } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { ColumnFilter, useFilter } from './ColumnFilter';
import { FetchLoader } from '../FetchLoader';

const CLASS_NAME = 'TupaiaHorizontalTreeColumn';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ContentContainer = styled.div`
  flex: 1;
  width: 278px;
  padding: 12px;
  overflow-y: overlay;
  border-right: 1px solid ${({ theme }) => theme.palette.grey['400']};

  .MuiListItem-root {
    border-radius: 10px;
    width: 100%;
    padding: 0;
    background-color: transparent;
    word-break: break-all;

    &.Mui-selected {
      color: ${({ isExpanded, showExpandIcon, theme }) =>
        !showExpandIcon || !isExpanded ? theme.palette.primary.contrastText : undefined};

      background-color: ${({ isExpanded, showExpandIcon, theme }) => {
        if (!showExpandIcon) {
          return theme.palette.primary.main;
        }
        if (isExpanded) {
          return fade(theme.palette.primary.main, 0.1);
        }
        return 'transparent';
      }};

      .MuiListItemText-root:hover {
        background-color: ${({ isExpanded, showExpandIcon, theme }) => {
          if (!showExpandIcon || !isExpanded) {
            return darken(theme.palette.primary.main, 0.1);
          }
          return undefined;
        }};
      }

      .MuiListItemText-root {
        background-color: ${({ isExpanded, theme }) => !isExpanded && theme.palette.primary.main};
      }
    }

    .MuiIconButton-root {
      width: 37px;
      height: 37px;
    }
  }

  .MuiListItemText-root {
    width: ${({ showExpandIcon }) => (showExpandIcon ? '217px' : '100%')};
    flex: none;
    margin: 0px;
    padding: 10px 16px;
    border-radius: 10px;

    &:hover {
      background-color: ${({ theme }) => theme.palette.grey['200']};
    }
  }
`;

const NoData = styled.div`
  margin: 16px 0 16px 16px;
`;

export const Column = ({
  data,
  isExpanded,
  isLoading,
  error,
  showExpandIcon,
  onSelect,
  onExpand,
}) => {
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
        <ContentContainer
          className={`${CLASS_NAME}-content`}
          isExpanded={isExpanded}
          showExpandIcon={showExpandIcon}
        >
          <FetchLoader isLoading={isLoading} isError={isError} error={error}>
            {filteredData?.length === 0 ? (
              <NoData>No data found</NoData>
            ) : (
              <List>
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
                        <IconButton aria-label="Expand item">
                          <ChevronRightIcon onClick={e => handleClickIcon(node, e)} />
                        </IconButton>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            )}
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
  isExpanded: PropTypes.bool,
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
  isExpanded: false,
  isLoading: false,
  error: null,
  showExpandIcon: true,
  onSelect: () => {},
  onExpand: () => {},
};
