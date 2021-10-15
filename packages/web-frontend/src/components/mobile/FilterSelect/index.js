/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import DropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import CircularProgress from 'material-ui/CircularProgress';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Overlay from '../Overlay';
// Genuine dependency cycle
import List from '../List';
import { GREY, LIGHT_GREY } from '../../../styles';

const TinyProgressContainer = styled.div`
  margin-right: 0.5rem;
`;

const TinyProgress = () => (
  <TinyProgressContainer>
    <CircularProgress size={15} thickness={2} />
  </TinyProgressContainer>
);

const buildListItems = items => {
  return items
    .map(item => {
      if (item.items) {
        return {
          title: item.category,
          items: buildListItems(item.items),
        };
      }

      return {
        data: item.code,
        key: item.code,
        title: item.label,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
};

const renderList = (filterItem, onFilterchange, currentFilter) => {
  let listItems;
  if (filterItem.items) {
    listItems = buildListItems(filterItem.items);
  } else {
    listItems = [
      {
        data: filterItem.code,
        key: filterItem.code,
        title: filterItem.label,
      },
    ];
  }
  const title = filterItem.category ? filterItem.category : '';

  return (
    <li style={styles.listItem} key={filterItem.code}>
      <List
        title={title}
        items={listItems}
        displayArrows={false}
        onSelectItem={onFilterchange}
        selectedItems={[currentFilter.code]}
      />
    </li>
  );
};

/**
 * Recursively flattens a filterShape into a key-label object.
 *
 * @param {filterShape} filterItems
 */
const getFlattenedCodes = filterItems => {
  let flattenedItems = {};

  filterItems.forEach(filterItem => {
    if (filterItem.code) {
      flattenedItems[filterItem.code] = filterItem.value;
    } else if (filterItem.items) {
      flattenedItems = { ...flattenedItems, ...getFlattenedCodes(filterItem.items) };
    }
  });

  return flattenedItems;
};

const renderFilterOverlay = (title, filters, currentFilter, onFilterSelect, onFilterClose) => (
  <Overlay titleText={title} onClose={onFilterClose} contentStyle={styles.overlayContent}>
    <ul style={styles.list}>
      {filters.map(filterItem => renderList(filterItem, onFilterSelect, currentFilter))}
    </ul>
  </Overlay>
);

/**
 * Displays a select box that triggers an overlay with option groups.
 */
const FilterSelect = ({
  title,
  filters,
  currentFilter,
  onFilterChange,
  onFilterOpen,
  onFilterClose,
  filterIsExpanded,
  showLoadingIcon,
  theme: { color },
}) => {
  const flatFilterValues = getFlattenedCodes(filters);

  const onFilterSelect = code => {
    onFilterClose();
    onFilterChange(flatFilterValues[code]);
  };

  return (
    <div style={styles.container}>
      <button type="button" onClick={onFilterOpen} style={styles.selectButton}>
        {showLoadingIcon && <TinyProgress />}
        <span style={{ ...styles.selectLabel, color }}>
          {currentFilter.overrideLabel || currentFilter.label}
        </span>
        <DropDownIcon style={{ color }} />
      </button>
      {filterIsExpanded
        ? renderFilterOverlay(title, filters, currentFilter, onFilterSelect, onFilterClose)
        : null}
    </div>
  );
};

export const filterShape = PropTypes.shape({
  label: PropTypes.string,
  code: PropTypes.string,
  value: PropTypes.any,
});

FilterSelect.propTypes = {
  title: PropTypes.string,
  filters: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        category: PropTypes.string,
        items: PropTypes.arrayOf(filterShape),
      }),
      filterShape,
    ]),
  ),
  filterIsExpanded: PropTypes.bool,
  onFilterChange: PropTypes.func,
  currentFilter: filterShape,
  onFilterOpen: PropTypes.func,
  onFilterClose: PropTypes.func,
  showLoadingIcon: PropTypes.bool,
};

FilterSelect.defaultProps = {
  title: 'Measures',
  filters: [],
  onFilterChange: () => {},
  onFilterOpen: () => {},
  onFilterClose: () => {},
  filterIsExpanded: true,
  showLoadingIcon: false,
};

const BUTTON_RESET = {
  padding: 0,
  background: 'none',
  appearance: 'none',
  outline: 0,
  border: 0,
};

const styles = {
  container: {
    borderBottom: `1px solid ${LIGHT_GREY}`,
    paddingBottom: '5px',
  },
  overlayContent: {
    overflowY: 'scroll',
    WebkitOverflowScrolling: 'touch',
  },
  selectButton: {
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    ...BUTTON_RESET,
  },
  selectLabel: {
    fontSize: 14,
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'right',
  },
  selectIcon: {
    minWidth: 24,
  },
  list: {
    padding: 0,
    margin: 0,
    listStyleType: 'none',
  },
  listItem: {
    borderBottom: `1px solid ${GREY}`,
  },
  listHeader: {
    margin: 0,
  },
};

export default FilterSelect;
