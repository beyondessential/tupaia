import { darken } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { FetchLoader } from '../FetchLoader';
import { ColumnFilter, useFilter } from './ColumnFilter';

const CLASS_NAME = 'TupaiaHorizontalTreeColumn';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 12px;
  min-width: 278px;
  overflow-y: auto;
  border-right: 1px solid ${({ theme }) => theme.palette.grey['400']};

  .MuiListItem-root {
    align-items: flex-start;
    border-radius: 10px;
    width: 100%;
    padding: 0;

    &:hover {
      background-color: ${({ readOnly, theme }) =>
        readOnly ? theme.palette.grey['200'] : 'transparent'};
    }

    &.Mui-selected {
      color: ${({ isExpanded, showExpandIcon, readOnly, theme }) =>
        readOnly || !showExpandIcon || !isExpanded
          ? theme.palette.primary.contrastText
          : undefined};

      background-color: ${({ isExpanded, showExpandIcon, readOnly, theme }) => {
        if (!showExpandIcon || readOnly) {
          return theme.palette.primary.main;
        }
        if (isExpanded) {
          return `oklch(from ${theme.palette.primary.main} l c h / 10%)`;
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

      .MuiIconButton-root {
        color: ${({ readOnly, theme }) =>
          readOnly ? theme.palette.primary.contrastText : undefined};
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
    margin: 0;
    padding: 10px 16px;
    border-radius: 10px;

    &:hover {
      background-color: ${({ theme, readOnly }) =>
        !readOnly ? theme.palette.grey['200'] : undefined};
    }
  }

  .MuiIconButton-root:hover {
    background-color: ${({ readOnly }) => (readOnly ? 'transparent' : undefined)};
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
  readOnly,
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
      // Expand when we click anywhere on the item
      if (!showExpandIcon || readOnly) {
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
          readOnly={readOnly}
        >
          <FetchLoader isLoading={isLoading} isError={isError} error={error}>
            {filteredData?.length === 0 ? (
              <NoData>No data found</NoData>
            ) : (
              <List>
                {filteredData?.map(node => {
                  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

                  return (
                    <ListItem
                      key={node.id}
                      button
                      selected={selected?.id === node.id}
                      onClick={() => handleClickItem(node)}
                    >
                      <ListItemText primary={node.name} color="primary" />
                      {showExpandIcon && hasChildren && (
                        <IconButton
                          aria-label="Expand item"
                          onClick={e => handleClickIcon(node, e)}
                        >
                          <ChevronRightIcon />
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
      children: PropTypes.arrayOf(PropTypes.any),
    }),
  ),
  readOnly: PropTypes.bool,
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
  readOnly: false,
  onSelect: () => {},
  onExpand: () => {},
};
