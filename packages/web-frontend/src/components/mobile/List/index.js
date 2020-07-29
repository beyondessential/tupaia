/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import DisclosureIcon from 'material-ui/svg-icons/navigation/chevron-right';
import SelectedIcon from 'material-ui/svg-icons/navigation/check';
import throttle from 'lodash/throttle';

import FilterSelect from '../FilterSelect';
import { delayMobileTapCallback } from '../../../utils';
import { DARK_BLUE, OFF_WHITE, LIGHT_GREY, MOBILE_MARGIN_SIZE, WHITE } from '../../../styles';

class List extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      fixedHeaderVisible: false,
    };
  }

  componentDidMount() {
    this.debouncedScroll = throttle(this.onScroll, 100).bind(this);

    window.addEventListener('scroll', this.debouncedScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.debouncedScroll);
  }

  onScroll() {
    if (!this.headerDiv) {
      return;
    }

    const { fixedHeaderOffset } = this.props;

    const headerDivY = this.headerDiv.getBoundingClientRect().y;
    const fixedHeaderVisible = headerDivY < fixedHeaderOffset;

    if (this.state.fixedHeaderVisible !== fixedHeaderVisible) {
      this.setState({ fixedHeaderVisible });
    }
  }

  renderHeader() {
    const {
      filters,
      fixedHeaderOffset,
      title,
      currentFilter,
      onFilterChange,
      filterIsExpanded,
      onFilterOpen,
      onFilterClose,
      showLoadingIcon,
    } = this.props;
    const { fixedHeaderVisible } = this.state;

    if (!title && filters.length === 0) {
      return null;
    }

    const header = (
      <div style={styles.header}>
        {filters.length > 0 && (
          <FilterSelect
            showLoadingIcon={showLoadingIcon}
            filters={filters}
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            filterIsExpanded={filterIsExpanded}
            onFilterOpen={onFilterOpen}
            onFilterClose={onFilterClose}
          />
        )}
      </div>
    );

    const fixedHeaderStyles = [
      styles.fixedHeader,
      { display: fixedHeaderVisible ? 'block' : 'none' },
      { top: fixedHeaderOffset },
    ];

    return (
      <div>
        <div
          ref={headerDiv => {
            this.headerDiv = headerDiv;
          }}
        >
          {header}
        </div>
        <div style={fixedHeaderStyles}>{header}</div>
      </div>
    );
  }

  renderListItem({ data, key, subTitle, title }, isFirst, isSelected, selectedItemHighlightColor) {
    const { onSelectItem, displayArrows } = this.props;

    return (
      <li style={styles.listItem} key={key}>
        <button
          type="button"
          onClick={() => delayMobileTapCallback(() => onSelectItem(data))}
          style={[styles.button, isSelected ? { background: selectedItemHighlightColor } : {}]}
          key={`button${key}`}
        >
          <div style={[styles.buttonInner, isFirst ? styles.buttonInnerFirst : {}]}>
            <div style={styles.listItemTitle}>{title}</div>
            {subTitle && <span style={styles.listItemSubTitle}>{subTitle}</span>}
            {isSelected && <SelectedIcon color={DARK_BLUE} />}
            {displayArrows && <DisclosureIcon color={DARK_BLUE} />}
          </div>
        </button>
      </li>
    );
  }

  renderCategoryItems(items, title, titleStyles = styles.title) {
    const { selectedItems, selectedItemHighlightColor } = this.props;

    return (
      <div style={styles.wrapper}>
        {title && (
          <div style={styles.header}>
            <h2 style={titleStyles}>{title}</h2>
          </div>
        )}
        {items.map((item, index) => {
          if (item.items) {
            return this.renderCategoryItems(item.items, item.title, styles.nestedTitle);
          }

          return this.renderListItem(
            item,
            index === 0,
            selectedItems.includes(item.key),
            selectedItemHighlightColor,
          );
        })}
      </div>
    );
  }

  render() {
    const { items, title } = this.props;
    return (
      <div style={styles.wrapper}>
        {title && (
          <div style={styles.header}>
            <h2 style={styles.title}>{title}</h2>
          </div>
        )}
        <ul style={styles.list}>{this.renderCategoryItems(items)}</ul>
      </div>
    );
  }
}

const styles = {
  wrapper: {
    color: DARK_BLUE,
    backgroundColor: WHITE,
  },
  header: {
    padding: `20px ${MOBILE_MARGIN_SIZE}px 10px`,
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    margin: 0,
    padding: 0,
    flexShrink: 1,
  },
  nestedTitle: {
    fontSize: 15,
    margin: 0,
    padding: 0,
    flexShrink: 1,
  },
  subTitle: {
    flexGrow: 1,
  },
  list: {
    padding: 0,
    margin: 0,
  },
  listItem: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    display: 'block',
    fontSize: 16,
    padding: 0,
    margin: 0,
    color: DARK_BLUE,
  },
  button: {
    display: 'block',
    width: '100%',
    padding: 0,
    outline: 0,
    border: 0,
    textAlign: 'left',
    background: 'none',
    ':active': {
      background: OFF_WHITE,
      color: DARK_BLUE,
    },
  },
  buttonInner: {
    borderTop: `1px solid ${LIGHT_GREY}`,
    padding: `${MOBILE_MARGIN_SIZE}px 0`,
    margin: `0 ${MOBILE_MARGIN_SIZE}px`,
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  buttonInnerFirst: {
    borderTop: 0,
  },
  buttonFocus: {
    backgroundColor: OFF_WHITE,
  },
  listItemTitle: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  listItemSubTitle: {
    marginLeft: 'auto',
    fontSize: 14,
    color: '#6C6C6C',
  },
  fixedHeader: {
    position: 'fixed',
    left: 0,
    width: '100%',
    zIndex: 1,
    background: LIGHT_GREY,
    borderBottom: '1px solid #eee',
  },
};

List.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subTitle: PropTypes.string,
      key: PropTypes.string,
      data: PropTypes.any,
    }),
  ).isRequired,
  onSelectItem: PropTypes.func.isRequired,
  fixedHeaderOffset: PropTypes.number,
  displayArrows: PropTypes.bool,
  selectedItems: PropTypes.arrayOf(PropTypes.string),
  selectedItemHighlightColor: PropTypes.string,
  ...FilterSelect.propTypes,
};

List.defaultProps = {
  subTitle: '',
  fixedHeaderOffset: 0,
  displayArrows: true,
  selectedItems: [],
  selectedItemHighlightColor: LIGHT_GREY,
  ...FilterSelect.defaultProps,
};

export default Radium(List);
